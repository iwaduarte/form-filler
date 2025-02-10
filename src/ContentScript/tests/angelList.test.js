import { filler, config, shouldUpdate } from "../Custom/angelList.js";

describe("config", () => {
  test("should have correct properties", () => {
    expect(config).toHaveProperty("attributes", false);
    expect(config).toHaveProperty("childList", true);
    expect(config).toHaveProperty("subtree", true);
  });
});

describe("filler function", () => {
  test("should fill the textarea with the message", () => {
    document.body.innerHTML = `
      <div class="styles_modal__MFCOh">
        <textarea id="hasId" placeholder="Write a note to John at..."></textarea>
      </div>
    `;
    const fields = [{ name: "Good Fit", value: "Hello #USER#!" }];

    filler(fields);

    const textarea = document.querySelector("textarea");
    expect(textarea.value).toBe("Hello John recruiter!");
  });
});

describe("shouldUpdate function", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="styles_modal__MFCOh">
        <textarea placeholder="Write a note to John at..."></textarea>
      </div>
    `;
  });

  test("should return false if none of the conditions are met", () => {
    const arrayList = [
      {
        target: {
          tagName: "DIV",
          className: "styles_unrelatedContainer",
        },
      },
    ];
    const result = shouldUpdate(arrayList);
    expect(result).toBe(false);
  });

  test("should return the textarea element if conditions are met", () => {
    const arrayList = [
      {
        target: {
          tagName: "DIV",
          className: "styles_motionContainer__0bu1f",
        },
      },
    ];
    const result = shouldUpdate(arrayList);
    const textarea = document.querySelector(".styles_modal__MFCOh textarea");
    expect(result).toBe(textarea);
  });

  test("should return false if the target is a textarea", () => {
    const arrayList = [
      {
        target: {
          tagName: "TEXTAREA",
          className: "styles_modal__MFCOh",
        },
      },
    ];
    const result = shouldUpdate(arrayList);
    expect(result).toBe(false);
  });

  test("should return the textarea element if className includes ReactModal__Content", () => {
    const arrayList = [
      {
        target: {
          tagName: "DIV",
          className: "ReactModal__Content",
        },
      },
    ];
    const result = shouldUpdate(arrayList);
    const textarea = document.querySelector(".styles_modal__MFCOh textarea");
    expect(result).toBe(textarea);
  });
});
