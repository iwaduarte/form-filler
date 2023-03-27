import { data } from "./cacheData.js";
import { getFile } from "../indexedDB.js";

//iife below
(async () => {})();

const defaultFiller = async (fields = []) => {
  inputFiller(fields);
  const fileInput = document.querySelector("input[type='file']");
  if (!fileInput) return;

  const file = await getFile();

  console.log("file", file);
  // const dataTransfer = new DataTransfer();
  // dataTransfer.items.add(file);
  // fileInput.files = dataTransfer.files;
};

const inputFiller = (fields = []) => {
  const allLabels = Array.from(document.querySelectorAll("LABEL, LEGEND"));
  allLabels.map((label) => {
    const { htmlFor, innerText } = label;

    const { value } =
      fields.find(({ name }) =>
        innerText.toLowerCase().includes(name.toLowerCase())
      ) || {};

    const input = htmlFor
      ? document.getElementById(htmlFor) ||
        document.querySelector(`input[name="${htmlFor}"]`)
      : label?.querySelector("input[type='text'],input[type='email']") ||
        label?.parentNode.querySelector(
          "input[type='text'],input[type='email']"
        );

    if (!value || !input) return null;

    input.value = value;
    input.innerHTML = value;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(input, value);
    input.dispatchEvent(new Event("change", { bubbles: true }));

    return input;
  });
};
const defaultHandleMutation = (mutationList) => {
  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    const shouldUpdate = mutationList.some((mutationRecord) => {
      const { addedNodes, target } = mutationRecord;
      return (
        target.tagName !== "INPUT" ||
        Array.from(addedNodes).filter(({ nodeName }) => {
          return nodeName !== "#text";
        }).length
      );
    });
    if (!shouldUpdate) return;

    console.log("Filling forms..");
    return defaultFiller(data.fields);
  }, 300);
};

const observeMutations = ({ config, handleMutation, watchSelector = "" }) => {
  const watchSelectors = ["#root", "#__next", "body"];
  watchSelector && watchSelectors.unshift(watchSelector);
  const reactRoot = document.querySelector(watchSelectors.join(","));
  console.log("reactRoot", reactRoot);
  if (reactRoot) {
    const observer = new MutationObserver(
      handleMutation || defaultHandleMutation
    );
    const _config = config || {
      attributes: false,
      childList: true,
      subtree: true,
    };

    observer.observe(reactRoot, _config);

    return observer;
  }
};

export { observeMutations, defaultFiller };
