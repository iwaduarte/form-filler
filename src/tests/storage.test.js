import {
  setStore,
  getFromStore,
  syncStore,
  addProperty,
  deleteProperty,
  addWhiteList,
  deleteWhiteList,
  updateProperty,
} from "../storage.js";

// Mock chrome.storage.sync
const mockChromeStorageSync = {
  set: jest.fn(),
  get: jest.fn(),
  onChanged: {
    addListener: jest.fn(),
  },
};

global.chrome = {
  storage: {
    sync: mockChromeStorageSync,
  },
};

describe("setStore and getFromStore", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should set and get data from the store", async () => {
    const testValue = [{ name: "test", value: "value" }];
    mockChromeStorageSync.set.mockImplementationOnce((_, cb) => cb());
    mockChromeStorageSync.get.mockImplementationOnce((_, cb) => cb({ formFiller: testValue }));

    await setStore(testValue);
    expect(mockChromeStorageSync.set).toHaveBeenCalledWith({ formFiller: testValue }, expect.any(Function));

    const storedValue = await getFromStore();
    expect(mockChromeStorageSync.get).toHaveBeenCalledWith("formFiller", expect.any(Function));
    expect(storedValue).toEqual(testValue);
  });
});

describe("addProperty and deleteProperty", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should add and delete a property", async () => {
    const initialValue = [{ name: "test", value: "value" }];
    const newProperty = { name: "newTest", value: "newValue" };
    const updatedValue = [...initialValue, newProperty];

    mockChromeStorageSync.get.mockImplementation((_, cb) => cb({ formFiller: initialValue }));
    mockChromeStorageSync.set.mockImplementation((_, cb) => cb());

    const addedValue = await addProperty(newProperty);
    expect(addedValue).toEqual(updatedValue);

    const deletedValue = await deleteProperty(1);
    expect(deletedValue).toEqual(initialValue);
  });
});

describe("addWhiteList and deleteWhiteList", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should add and delete a whitelist item", async () => {
    const url = "example.com";
    const initialWhiteList = {};
    const updatedWhiteList = { [url]: true };

    mockChromeStorageSync.get.mockImplementation((_, cb) => cb({ whiteList: initialWhiteList }));
    mockChromeStorageSync.set.mockImplementation((_, cb) => cb());

    const addedWhiteList = await addWhiteList(url);
    expect(addedWhiteList).toEqual(updatedWhiteList);

    const deletedWhiteList = await deleteWhiteList(url);
    expect(deletedWhiteList).toEqual({ [url]: false });
  });
});

describe("updateProperty", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should update a property", async () => {
    const initialValue = [{ name: "test", value: "value" }];
    const updatedData = { value: "updatedValue" };
    const updatedValue = [{ name: "test", value: "updatedValue" }];

    mockChromeStorageSync.get.mockImplementation((_, cb) => cb({ formFiller: initialValue }));
    mockChromeStorageSync.set.mockImplementation((_, cb) => cb());

    await updateProperty("test", updatedData);
    expect(mockChromeStorageSync.set).toHaveBeenCalledWith({ formFiller: updatedValue }, expect.any(Function));
  });
});

describe("syncStore", () => {
  test("should add an onChanged listener for the store", () => {
    syncStore(() => {});
    expect(mockChromeStorageSync.onChanged.addListener).toHaveBeenCalledWith(expect.any(Function));
  });
});
