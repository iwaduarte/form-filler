const { sync, onChanged } = chrome.storage;

const setStore = (value, key = "formFiller") =>
  new Promise((res) => {
    sync.set({ [key]: value }, () => {
      res("done");
    });
  });
const getFromStore = (key = "formFiller") =>
  new Promise((res) => {
    sync.get(key, (data) => {
      const { [key]: propKey = [] } = data || {};
      res(key === null ? data : propKey);
    });
  });

const syncStore = (updateChanges) => onChanged.addListener(updateChanges);

export { setStore, getFromStore, syncStore };
