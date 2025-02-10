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
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  get: function () {
    return this.style.display === "none" || this.style.visibility === "hidden" ? 0 : 100;
  },
});
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  get: function () {
    return this.style.display === "none" || this.style.visibility === "hidden" ? 0 : 20;
  },
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
