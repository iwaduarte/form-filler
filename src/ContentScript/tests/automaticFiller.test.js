import {
  defaultFiller,
  inputFiller,
  matchSelectValue,
  observeMutations,
  updateElementValue,
} from "../automaticFiller.js";

describe("defaultFiller", () => {
  test("should fill input and textarea elements", () => {
    document.body.innerHTML = `
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" />
        <label for="message">Message:</label>
        <textarea id="message"></textarea>
      </div>
    `;
    const fields = [
      { name: "Email", value: "test@example.com" },
      { name: "Message", value: "Hello!" },
    ];

    defaultFiller(fields);

    const emailInput = document.getElementById("email");
    const messageTextarea = document.getElementById("message");
    expect(emailInput.value).toBe("test@example.com");
    expect(messageTextarea.value).toBe("Hello!");
  });
});

describe("observeMutations", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should call defaultFiller on mutations", () => {
    document.body.innerHTML = `
      <div id="__next">
        <label for="email">Email:</label>
        <input type="email" id="email" />
        <label for="message">Message:</label>
        <textarea id="message"></textarea>
      </div>
    `;

    const fields = [
      { name: "Email", value: "test@example.com" },
      { name: "Message", value: "Hello!" },
    ];

    global.data = { fields, isEnabled: true };

    const defaultFillerSpy = jest.spyOn(module, "defaultFiller");

    const observer = observeMutations({});

    const newNode = document.createElement("div");
    newNode.innerHTML = "<p>New content</p>";
    document.getElementById("__next").appendChild(newNode);

    jest.advanceTimersByTime(300);
    expect(defaultFillerSpy).toHaveBeenCalled();

    observer.disconnect();
  });

  test("should not call defaultFiller when conditions are not met", () => {
    document.body.innerHTML = `
      <div id="__next">
        <label for="email">Email:</label>
        <input type="email" id="email" />
        <label for="message">Message:</label>
        <textarea id="message"></textarea>
      </div>
    `;

    const fields = [
      { name: "Email", value: "test@example.com" },
      { name: "Message", value: "Hello!" },
    ];

    global.data = { fields, isEnabled: true };

    const defaultFillerSpy = jest.spyOn(module, "defaultFiller");

    const observer = observeMutations({});

    const newNode = document.createElement("input");
    newNode.setAttribute("type", "text");
    document.getElementById("__next").appendChild(newNode);

    jest.advanceTimersByTime(300);
    expect(defaultFillerSpy).not.toHaveBeenCalled();

    observer.disconnect();
  });
});

describe("matchSelectValue", () => {
  test("should return the matching option value", () => {
    document.body.innerHTML = `
      <select>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </select>
    `;
    const selectElement = document.querySelector("select");
    const desiredValue = "Option 2";
    const expectedValue = "option2";

    const result = matchSelectValue(desiredValue, selectElement);
    expect(result).toBe(expectedValue);
  });

  test("should return null if no matching option found", () => {
    document.body.innerHTML = `
      <select>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </select>
    `;
    const selectElement = document.querySelector("select");
    const desiredValue = "Option 3";

    const result = matchSelectValue(desiredValue, selectElement);
    expect(result).toBeNull();
  });
});

describe("updateElementValue", () => {
  test("should update the value of the element and trigger change event", () => {
    document.body.innerHTML = `
      <input type="text" id="testInput" />
    `;
    const inputElement = document.getElementById("testInput");
    const newValue = "New value";

    const changeEvent = jest.fn();
    inputElement.addEventListener("change", changeEvent);

    updateElementValue(inputElement, newValue);

    expect(inputElement.value).toBe(newValue);
    expect(changeEvent).toHaveBeenCalled();
  });
});

describe("inputFiller", () => {
  test("should fill input and textarea elements with field values", () => {
    document.body.innerHTML = `
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" />
        <label for="message">Message:</label>
        <textarea id="message"></textarea>
      </div>
    `;
    const fields = [
      { name: "Email", value: "test@example.com" },
      { name: "Message", value: "Hello!" },
    ];

    inputFiller(fields);

    const emailInput = document.getElementById("email");
    const messageTextarea = document.getElementById("message");
    expect(emailInput.value).toBe("test@example.com");
    expect(messageTextarea.value).toBe("Hello!");
  });
});
