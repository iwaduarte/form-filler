import React from "react";
import ReactDOM from "react-dom/client";
import Content from "./Content.jsx";
import css from "./content.css";

window.onload = () => {
  const div = document.createElement("div");
  const shadow = div.attachShadow({ mode: "open" });
  const CSSStyle = new CSSStyleSheet();

  div.setAttribute("id", "form-filler-ext");
  CSSStyle.replaceSync(css);
  shadow.adoptedStyleSheets = [CSSStyle];
  document.body.appendChild(div);

  ReactDOM.createRoot(shadow).render(
    <React.StrictMode>
      <Content />
    </React.StrictMode>
  );
};
