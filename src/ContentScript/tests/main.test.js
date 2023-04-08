import React from "react";
import { startApplication } from "../main.jsx";
import { defaultFiller } from "../automaticFiller.js";
import * as angelList from "../Custom/angelList.js";
import * as yCombinator from "../Custom/yCombinator.js";

const mockData = {
  isEnabled: true,
  fields: [
    { name: "Field 1", value: "Value 1" },
    { name: "Field 2", value: "Value 2" },
  ],
  whiteList: { "test.com": true },
  file: null,
};

// Mock siteConfiguration
const siteConfiguration = {
  "angel.co": angelList,
  "wellfound.com": angelList,
  "workatastartup.com": yCombinator,
};

jest.mock("../automaticFiller.js", () => ({
  defaultFiller: jest.fn(),
}));

jest.mock("../Custom/angelList.js", () => ({
  filler: jest.fn(),
}));

jest.mock("../Custom/yCombinator.js", () => ({
  filler: jest.fn(),
}));

describe("startApplication", () => {
  test("should fill forms with defaultFiller for an unrecognized site", async () => {
    await startApplication(null, mockData, siteConfiguration);

    const ctrlAltFEvent = new KeyboardEvent("keydown", {
      key: "f",
      ctrlKey: true,
      altKey: true,
    });

    document.dispatchEvent(ctrlAltFEvent);

    expect(defaultFiller).toHaveBeenCalled();
  });

  test("should fill forms with angelList.filler for an angelList site", async () => {
    const angelListData = { ...mockData, url: "angel.co" };
    await startApplication(null, angelListData, siteConfiguration);

    const ctrlAltFEvent = new KeyboardEvent("keydown", {
      key: "f",
      ctrlKey: true,
      altKey: true,
    });

    document.dispatchEvent(ctrlAltFEvent);

    expect(angelList.filler).toHaveBeenCalled();
  });

  test("should fill forms with yCombinator.filler for a yCombinator site", async () => {
    const yCombinatorData = { ...mockData, url: "workatastartup.com" };
    await startApplication(null, yCombinatorData, siteConfiguration);

    const ctrlAltFEvent = new KeyboardEvent("keydown", {
      key: "f",
      ctrlKey: true,
      altKey: true,
    });

    document.dispatchEvent(ctrlAltFEvent);

    expect(yCombinator.filler).toHaveBeenCalled();
  });
});
