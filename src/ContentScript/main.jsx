import React from "react";
import ReactDOM from "react-dom/client";
import css from "./content.css";
import Context from "./Context.jsx";
import { getFromStore, syncStore } from "../storage.js";
import { defaultFiller, observeMutations } from "./automaticFiller.js";
import * as angelList from "./Custom/angelList.js";
import { data } from "./cacheData.js";

const siteConfiguration = {
  "angel.co": angelList,
};

const ignoredURLs = {
  "google.com": true,
  "gmail.com": true,
  "stackoverflow.com": true,
  "linkedin.com": true,
};

const startApplication = async () => {
  const div = document.createElement("div");
  const shadow = div.attachShadow({ mode: "open" });
  const CSSStyle = new CSSStyleSheet();

  div.setAttribute("id", "form-filler-ext");
  CSSStyle.replaceSync(css);
  shadow.adoptedStyleSheets = [CSSStyle];
  document.body.appendChild(div);
  const url = document.location.hostname;

  if (ignoredURLs[url]) return;

  const { isEnabled, formFiller } = await getFromStore(null);
  data.store = formFiller;

  syncStore((changes) => {
    const { formFiller, isEnabled: _isEnabled = true } = changes;
    const { newValue } = formFiller || {};
    const store = newValue || data.store;
    data.store = store;
    _isEnabled && fillForms(store);
  });

  if (!isEnabled) return;

  const { config, handleMutation, filler } = siteConfiguration[url] || {};
  const fillForms = filler || defaultFiller;
  fillForms(data.store);

  const observer = observeMutations({ config, handleMutation });

  ReactDOM.createRoot(shadow).render(
    <React.StrictMode>
      <Context fields={data.store} />
    </React.StrictMode>
  );
};

startApplication();
