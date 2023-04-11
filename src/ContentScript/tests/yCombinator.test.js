import { filler, config, shouldUpdate } from "../Custom/yCombinator.js";

describe("filler function", () => {
  test("should fill the textarea with the message", () => {
    document.body.innerHTML = `
      <div id="headlessui-dialog-panel">
        <div>Reach out to John at...</div>
        <textarea></textarea>
      </div>
    `;
    const fields = [{ name: "Good Fit", value: "Hello #USER#!" }];

    filler(fields);

    const textarea = document.querySelector("textarea");
    expect(textarea.value).toBe("Hello John!");
  });
});

describe("config", () => {
  test("should have correct properties", () => {
    expect(config).toHaveProperty("attributes", false);
    expect(config).toHaveProperty("childList", true);
    expect(config).toHaveProperty("subtree", false);
  });
});

describe("shouldUpdate", () => {
  test("should return true if a node with id 'headlessui-portal-root' is found", () => {
    const arrayList = [
      {
        addedNodes: [{ id: "not-relevant" }],
      },
      {
        addedNodes: [{ id: "headlessui-portal-root" }],
      },
    ];
    expect(shouldUpdate(arrayList)).toBe(true);
  });

  test("should return false if no node with id 'headlessui-portal-root' is found", () => {
    const arrayList = [
      {
        addedNodes: [{ id: "not-relevant" }],
      },
      {
        addedNodes: [{ id: "another-not-relevant" }],
      },
    ];
    expect(shouldUpdate(arrayList)).toBe(false);
  });

  test("should return false if an empty array is provided", () => {
    const arrayList = [];
    expect(shouldUpdate(arrayList)).toBe(false);
  });

  test("should return false if undefined or null is provided", () => {
    expect(shouldUpdate(undefined)).toBe(false);
    expect(shouldUpdate(null)).toBe(false);
  });
});
