import { jest } from "@jest/globals";

Object.defineProperty(window.Element.prototype, "innerText", {
  get() {
    return this.textContent;
  },
  set(value) {
    this.textContent = value;
  },
  configurable: true,
  enumerable: true,
});

global.chrome = {
  storage: {
    sync: {
      set: jest.fn(),
      get: jest.fn(),
    },
    onChanged: {
      addListener: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn((_, cb) => cb([{ id: 1 }])),
    sendMessage: jest.fn(),
  },
};
