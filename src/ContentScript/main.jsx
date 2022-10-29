import React from "react";
import ReactDOM from "react-dom/client";
import css from "./content.css";
import Context from "./Context.jsx";

const ignoredURLs = ["google.com", "gmail.com", "stackoverflow.com"];

window.onload = () => {
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
  // Create a Context Object surrounding the AutomaticFiller and Content
  // Gets data from store
  // 1) Updates "formFiller" properties
  // 2) Disable icon and script if not enabled
  ReactDOM.createRoot(shadow).render(
    <React.StrictMode>
      <Context />
    </React.StrictMode>
  );
};
