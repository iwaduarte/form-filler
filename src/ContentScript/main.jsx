import React from "react";
import ReactDOM from "react-dom/client";
import css from "./content.css";
import Context from "./Context.jsx";
import {
  addWhiteList,
  deleteWhiteList,
  getFromStore,
  ignoreWebsite,
  removeFromIgnoreWebsite,
  syncStore,
} from "../storage.js";
import { waitForIdle } from "./waitForIddle.js";
import { defaultFiller, observeMutations, updateFilledElements } from "./automaticFiller.js";
import * as angelList from "./Custom/angelList.js";
import * as yCombinator from "./Custom/yCombinator.js";
import { data } from "./cacheData.js";
import { base64ToBlob } from "../file.js";
import HotkeyCommands from "./HotkeyCommands.jsx";

const siteConfiguration = {
  "angel.co": angelList,
  "wellfound.com": angelList,
  "workatastartup.com": yCombinator,
};

const browserObject = chrome || browser;

let _pdfFile = null;
try {
  _pdfFile = pdfFile;
} catch (e) {
  console.log("Error importing pdf", e);
}

const startOnKey = async (evt, fillForms) => {
  if (!data.isEnabled) return;

  const url = document.location.hostname.replace(/^(www\.)/, "");

  const modifier = evt.ctrlKey || evt.metaKey;

  if (modifier && evt.altKey && evt.key === "f") {
    console.log(url);
    await fillForms(data.fields);
  }

  if (modifier && evt.altKey && evt.key === "i") {
    const newData = await ignoreWebsite(url);
    data.ignoreList = { ...data.ignoreList, ...newData };
  }
  if (modifier && evt.altKey && evt.key === "k") {
    const newData = await removeFromIgnoreWebsite(url);
    data.ignoreList = { ...data.ignoreList, ...newData };
  }

  if (modifier && evt.altKey && evt.key === "a") {
    const newData = await addWhiteList(url);
    data.whiteList = { ...data.whiteList, ...newData };
  }

  if (modifier && evt.altKey && evt.key === "r") {
    const newData = await deleteWhiteList(url);
    data.whiteList = { ...data.whiteList, ...newData };
  }
};

const createShadowElement = () => {
  const div = document.createElement("div");
  const shadow = div.attachShadow({ mode: "open" });
  const CSSStyle = new CSSStyleSheet();
  div.setAttribute("id", "form-filler-ext");
  CSSStyle.replaceSync(css);

  try {
    shadow.adoptedStyleSheets = [CSSStyle];
  } catch (e) {
    console.log("Error", e);
    const style = document.createElement("style");
    style.textContent = css;
    shadow.appendChild(style);
  }
  document.body.appendChild(div);
  return shadow;
};

const createReactRoot = (element) => {
  return ReactDOM.createRoot(element);
};

const startApplication = async (pdfFile, siteConfiguration, data) => {
  const shadow = createShadowElement();
  const reactRoot = createReactRoot(shadow);
  data.file = pdfFile ? await base64ToBlob(pdfFile, "application/pdf") : null;

  const url = document.location.hostname.replace(/^(www\.)/, "");
  data.url = url;
  const { config, handleMutation, filler, watchSelector } = siteConfiguration[url] || {};
  const fillForms = filler || defaultFiller;
  const { isEnabled, navBar, formFiller = [], whiteList = {} } = (await getFromStore(null)) || {};

  data.whiteList = { ...data.whiteList, ...whiteList };
  data.fields = formFiller;
  data.isEnabled = isEnabled ?? data.isEnabled;
  data.navBar = navBar ?? data.navBar;

  const component = (
    <React.StrictMode>
      <HotkeyCommands />
      <Context fields={data.fields} isEnabled={data.isEnabled} whiteListed={data.whiteList[url]} url={url} />
    </React.StrictMode>
  );

  document.addEventListener("keydown", (evt) => startOnKey(evt, fillForms));

  syncStore(async (changes) => {
    const { formFiller, navBar, isEnabled: isEnabledFromSync = true, whiteList } = changes;

    const { newValue: newFormValues } = formFiller || {};

    data.fields = newFormValues || data.fields;
    data.isEnabled = isEnabledFromSync?.newValue || data.isEnabled;
    data.whiteList = { ...data.whiteList, ...whiteList?.newValue };
    data.navBar = navBar?.newValue || data.navBar;

    if (data.isEnabled) {
      updateFilledElements();
      await fillForms(data.fields);
    }
  });

  browserObject.runtime.onMessage.addListener(async function (message) {
    const { action, file } = message;
    if (action === "fill") {
      const fileData = await base64ToBlob(JSON.parse(file));
      data.file = fileData;
      await fillForms(data.fields, fileData);
    }
  });

  if (data.navBar) reactRoot.render(component);

  // !data.whiteList[url] ||
  if (isEnabled === false) return;

  observeMutations({ config, handleMutation, watchSelector });
};

waitForIdle({ idleTimeout: 600, maxWait: 1500 }).then(() => {
  console.log("Network is idle (or maxWait reached");
  startApplication(_pdfFile, siteConfiguration, data).then();
});

export { startApplication };
