const { sync, onChanged } = chrome.storage;

const setStore = (value) =>
  new Promise((res) => {
    sync.set({ formFiller: value }, () => {
      res("done");
    });
  });
const getFromStore = (key) =>
  new Promise((res) => {
    sync.get(key || "formFiller", (data) => {
      const { formFiller = [] } = data || {};
      res(formFiller);
    });
  });

const syncStore = (updateChanges) => onChanged.addListener(updateChanges);

export { setStore, getFromStore, syncStore };
