import React from "react";
import ReactDOM from "react-dom/client";
import css from "./content.css";
import Context from "./Context.jsx";
import { getFromStore, setStore, syncStore } from "../storage.js";
import { defaultFiller, observeMutations } from "./automaticFiller.js";
import * as angelList from "./Custom/angelList.js";
import * as yCombinator from "./Custom/yCombinator.js";
import { data } from "./cacheData.js";

const siteConfiguration = {
  "angel.co": angelList,
  "workatastartup.com": yCombinator,
};

const startOnKey = async (evt, fillForms, reactRoot, component) => {
  const url = document.location.hostname.replace("www.", "");

  if (evt.ctrlKey && evt.altKey && evt.key === "f") {
    if (!data.isEnabled) return;
    console.log(url);
    fillForms(data.store);
    reactRoot.render(component);
  }

  if (evt.ctrlKey && evt.altKey && evt.key === "A") {
    const storedItem = (await getFromStore("whiteList")) || [];
    const newData = { ...storedItem, [url]: true };
    await setStore(newData);
    data.whiteList = { ...data.whiteList, ...newData };
  }
};

const createShadowElement = () => {
  const div = document.createElement("div");
  const shadow = div.attachShadow({ mode: "open" });
  const CSSStyle = new CSSStyleSheet();
  div.setAttribute("id", "form-filler-ext");
  CSSStyle.replaceSync(css);
  shadow.adoptedStyleSheets = [CSSStyle];
  document.body.appendChild(div);

  return shadow;
};

const createReactRoot = (element) => {
  return ReactDOM.createRoot(element);
};

const startApplication = async () => {
  const shadow = createShadowElement();
  const reactRoot = createReactRoot(shadow);
  const component = (
    <React.StrictMode>
      <Context fields={data.store} />
    </React.StrictMode>
  );
  const url = document.location.hostname.replace("www.", "");
  const { config, handleMutation, filler, watchSelector } =
    siteConfiguration[url] || {};
  const fillForms = filler || defaultFiller;
  const {
    isEnabled = false,
    formFiller = [],
    whiteList = {},
  } = (await getFromStore(null)) || {};

  data.whiteList = { ...data.whiteList, ...whiteList };
  data.store = formFiller;
  data.isEnabled = isEnabled;

  document.addEventListener("keydown", (evt) =>
    startOnKey(evt, fillForms, reactRoot, component)
  );

  syncStore((changes) => {
    const { formFiller, isEnabled: _isEnabled = true, whiteList } = changes;
    const { newValue } = formFiller || {};
    const store = newValue || data.store;
    data.store = store;
    data.whiteList = { ...data.whiteList, ...whiteList };
    data.isEnabled = isEnabled;

    _isEnabled && fillForms(store);
  });

  if (!data.whiteList[url] || !isEnabled) return;
  fillForms(data.store);

  observeMutations({ config, handleMutation, watchSelector });

  reactRoot.render(component);
};

startApplication().then();
