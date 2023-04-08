import { filler, config, handleMutation } from "../Custom/yCombinator.js";

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

describe("handleMutation", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should call filler when conditions are met", () => {
    document.body.innerHTML = `
      <div id="headlessui-dialog-panel">
        <div>Reach out to John at...</div>
        <textarea></textarea>
      </div>
    `;

    const mutationList = [
      {
        addedNodes: [
          {
            id: "headlessui-portal-root",
          },
        ],
      },
    ];

    const fillerSpy = jest.spyOn(module, "filler");

    handleMutation(mutationList);

    jest.advanceTimersByTime(300);
    expect(fillerSpy).toHaveBeenCalled();
  });

  test("should not call filler when conditions are not met", () => {
    const mutationList = [
      {
        addedNodes: [
          {
            id: "unrelated-element",
          },
        ],
      },
    ];

    const fillerSpy = jest.spyOn(module, "filler");

    handleMutation(mutationList);

    jest.advanceTimersByTime(300);
    expect(fillerSpy).not.toHaveBeenCalled();
  });
});
