import { data } from "./cacheData.js";

const defaultFiller = (fields = []) => {
  const allLabels = Array.from(document.getElementsByTagName("LABEL"));
  allLabels.map((label) => {
    const { htmlFor, innerText } = label;

    const { value } =
      fields.find(({ name }) =>
        innerText.toLowerCase().includes(name.toLowerCase())
      ) || {};

    const _input = htmlFor
      ? document.getElementById(htmlFor)
      : label.querySelector("input[type='text'],input[type='email']");

    const input = _input || document.querySelector(`input[name="${htmlFor}"]`);

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
    defaultFiller(data.store);
  }, 300);
};

const observeMutations = ({ config, handleMutation, watchSelector = "" }) => {
  const watchSelectors = ["#root", "#__next"];
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
