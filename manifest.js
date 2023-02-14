import pkg from "./package.json";

const manifest = {
  background: {
    scripts: ["src/Background/background.js", "src/Background/hot-reload.js"],
    persistent: false,
  },
  content_scripts: [
    {
      js: ["src/ContentScript/main.jsx"],
      run_at: "document_end",
      matches: ["<all_urls>"],
    },
  ],
  options_ui: {
    page: "src/Options/index.html",
    open_in_tab: true,
  },
  browser_action: {
    default_icon: "form-filler.png",
    default_title: "Form-Filler",
    default_popup: "src/Popup/index.html",
  },
  permissions: ["activeTab", "tabs", "storage", "management", "<all_urls>"],
};

export default {
  author: pkg.author,
  description: pkg.description,
  name: pkg.displayName ?? pkg.name,
  version: pkg.version,
  manifest_version: 2,
  ...manifest,
};
