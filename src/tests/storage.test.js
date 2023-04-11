import { jest } from "@jest/globals";
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

const { chrome } = global;
const {
  storage: { sync, onChanged },
} = chrome;

describe("setStore and getFromStore", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should set and get data from the store", async () => {
    const testValue = [{ name: "test", value: "value" }];
    sync.set.mockImplementationOnce((_, cb) => cb());
    sync.get.mockImplementationOnce((_, cb) => cb({ formFiller: testValue }));

    await setStore(testValue);
    expect(sync.set).toHaveBeenCalledWith({ formFiller: testValue }, expect.any(Function));

    const storedValue = await getFromStore();
    expect(sync.get).toHaveBeenCalledWith("formFiller", expect.any(Function));
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

    sync.get.mockImplementation((_, cb) => cb({ formFiller: initialValue }));
    sync.set.mockImplementation((_, cb) => cb());

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

    sync.get.mockImplementation((_, cb) => cb({ whiteList: initialWhiteList }));
    sync.set.mockImplementation((_, cb) => cb());

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

    sync.get.mockImplementation((_, cb) => cb({ formFiller: initialValue }));
    sync.set.mockImplementation((_, cb) => cb());

    await updateProperty("test", updatedData);
    expect(sync.set).toHaveBeenCalledWith({ formFiller: updatedValue }, expect.any(Function));
  });
});

describe("syncStore", () => {
  test("should add an onChanged listener for the store", () => {
    syncStore(() => {});
    expect(onChanged.addListener).toHaveBeenCalledWith(expect.any(Function));
  });
});
