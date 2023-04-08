import { autoFillerSelect } from "../Custom/greenHouse.js";

describe("autoFillerSelect function", () => {
  test("should update the span innerText and value", () => {
    document.body.innerHTML = `
      <div>
        <select>
          <option value="Option 1">Option 1</option>
          <option value="Option 2">Option 2</option>
        </select>
        <div>
          <a><span></span></a>
        </div>
      </div>
    `;

    const selectElement = document.querySelector("select");
    const newValue = "Option 2";

    autoFillerSelect(selectElement, newValue);

    const span = selectElement.parentNode.querySelector("div > a > span");
    expect(span.innerText).toBe(newValue);
    expect(span.value).toBe(newValue);
  });
});
