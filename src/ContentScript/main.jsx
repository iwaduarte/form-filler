import React from "react";
import ReactDOM from "react-dom/client";
import Content from "./Content.jsx";
import css from "./content.css";
import AutomaticFiller from "./AutomaticFiller.jsx";
import { getFromStore } from "../storage.js";

const ignoredURLs = ["google.com", "gmail.com", "stackoverflow.com"];

window.onload = async () => {
  const div = document.createElement("div");
  const shadow = div.attachShadow({ mode: "open" });
  const CSSStyle = new CSSStyleSheet();

  div.setAttribute("id", "form-filler-ext");
  CSSStyle.replaceSync(css);
  shadow.adoptedStyleSheets = [CSSStyle];
  document.body.appendChild(div);

  const url = document.location.href;

  if (ignoredURLs.some((ignoredURL) => url.includes(ignoredURL))) {
    return;
  }

  ReactDOM.createRoot(shadow).render(
    <React.StrictMode>
      <Content />
      <AutomaticFiller />
    </React.StrictMode>
  );
};
