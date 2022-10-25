import pkg from "./package.json";

const manifest = {
  background: {
    scripts: ["src/Background/background.js"],
    persistent: false,
  },
  content_scripts: [
    {
      js: ["src/ContentScript/Content.jsx"],
      matches: ["<all_urls>"],
    },
  ],
  browser_action: {
    default_icon: "form-filler.png",
    default_title: "Form-Filler",
    default_popup: "src/Popup/index.html",
  },
  permissions: ["*://*/*"],
  // permissions: ["activeTab", "storage"],
};

export default {
  author: pkg.author,
  description: pkg.description,
  name: pkg.displayName ?? pkg.name,
  version: pkg.version,
  manifest_version: 2,
  ...manifest,
};
