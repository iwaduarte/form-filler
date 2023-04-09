import pkg from "./package.json";

const manifest = {
  background: {
    scripts: ["src/Background/background.js"],
    persistent: false,
  },

  options_ui: {
    page: "src/Options/index.html",
    open_in_tab: true,
  },
  browser_action: {
    default_icon: "form-filler.png",
    default_title: "Form-Filler",
    default_popup: "src/Popup/index.html",
  },
  web_accessible_resources: ["src/ContentScript/main.jsx"],
  permissions: ["activeTab", "tabs", "storage", "management", "<all_urls>"],
  browser_specific_settings: {
    gecko: {
      id: "form-filler@iwaduarte.dev",
    },
  },
};

export default {
  author: pkg.author,
  description: pkg.description,
  name: pkg.displayName ?? pkg.name,
  version: pkg.version,
  manifest_version: 2,
  ...manifest,
};
