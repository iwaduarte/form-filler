import { filler, config, handleMutation } from "../Custom/angelList.js";

describe("filler function", () => {
  test("should fill the textarea with the message", () => {
    document.body.innerHTML = `
      <div class="styles_modal__MFCOh">
        <textarea placeholder="Write a note to John at..."></textarea>
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
    expect(config).toHaveProperty("subtree", true);
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
      <div class="styles_modal__MFCOh">
        <textarea placeholder="Write a note to John at..."></textarea>
      </div>
    `;

    const mutationList = [
      {
        target: {
          tagName: "DIV",
          className: "styles_motionContainer__0bu1f",
        },
      },
    ];

    const fillerSpy = jest.spyOn(module, "filler");

    handleMutation(mutationList);

    jest.advanceTimersByTime(600);
    expect(fillerSpy).toHaveBeenCalled();
  });

  test("should not call filler when conditions are not met", () => {
    const mutationList = [
      {
        target: {
          tagName: "DIV",
          className: "styles_unrelatedContainer",
        },
      },
    ];

    const fillerSpy = jest.spyOn(module, "filler");

    handleMutation(mutationList);

    jest.advanceTimersByTime(600);
    expect(fillerSpy).not.toHaveBeenCalled();
  });
});
