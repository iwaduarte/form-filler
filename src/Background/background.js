const { tabs } = chrome;

tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  tabs.executeScript({
    allFrames: true,
    file: "src/ContentScript/main.js",
  });
});
