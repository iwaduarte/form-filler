// noinspection JSIncompatibleTypesComparison

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

const addProperty = async (data, key = "formFiller") => {
  const { name, value } = data || {};
  const storedItem = (await getFromStore(key)) || [];
  if (!name || !value) return storedItem;
  const newData = [...storedItem, data];
  await setStore(newData);
  return newData;
};

const deleteProperty = async (index, key = "formFiller") => {
  const storedItem = (await getFromStore(key)) || [];
  storedItem.splice(index, 1);
  await setStore(storedItem);
  return storedItem;
};

const updateProperty = async (propertyName, updatedData = []) => {
  const storedItem = (await getFromStore("formFiller")) || [];
  const propertyIndex = storedItem.findIndex((property) => property.name === propertyName);

  if (propertyIndex !== -1) {
    storedItem[propertyIndex] = {
      ...storedItem[propertyIndex],
      ...updatedData,
    };
    await setStore(storedItem);
  }
};

const addWhiteList = async (url) => {
  const storedItem = (await getFromStore("whiteList")) || {};
  if (!url) return storedItem;
  const newWhiteList = { ...storedItem, [url]: true };
  await setStore(newWhiteList, "whiteList");
  return newWhiteList;
};
const deleteWhiteList = async (url) => {
  const storedItem = (await getFromStore("whiteList")) || {};
  if (!url) return storedItem;
  const newData = { ...storedItem, [url]: false };
  await setStore(newData, "whiteList");
  return newData;
};

const syncStore = (updateChanges) => onChanged.addListener(updateChanges);

export {
  setStore,
  getFromStore,
  syncStore,
  addProperty,
  deleteProperty,
  addWhiteList,
  deleteWhiteList,
  updateProperty,
};
