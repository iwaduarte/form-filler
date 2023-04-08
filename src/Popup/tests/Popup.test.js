import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Popup from "../Popup.jsx";

// Mocking Chrome APIs
global.chrome = {
  runtime: {
    openOptionsPage: jest.fn(),
  },
  storage: {
    sync: {
      set: jest.fn(),
      get: jest.fn((key, callback) => callback({ formFiller: [], isEnabled: true })),
      onChanged: {
        addListener: jest.fn(),
      },
    },
  },
};

describe("Popup", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<Popup />);
    expect(getByText("orm-Filler")).toBeInTheDocument();
  });

  it("toggles ON/OFF switch", () => {
    const { getByLabelText } = render(<Popup />);
    const toggle = getByLabelText("", { selector: "input[type='checkbox']" });
    fireEvent.click(toggle);
    expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ isEnabled: false }, expect.any(Function));
  });

  it("opens options page", () => {
    const { getByText } = render(<Popup />);
    const goToOptions = getByText("Go to Options");
    fireEvent.click(goToOptions);
    expect(global.chrome.runtime.openOptionsPage).toHaveBeenCalled();
  });

  // Add more test cases for handleAddProperty, handleDeleteProperty, etc.
});
