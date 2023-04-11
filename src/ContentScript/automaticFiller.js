import { data } from "./cacheData.js";
import { autoFillerSelect } from "./Custom/greenHouse.js";

const autoFiller = {
  "boards.greenhouse.io": autoFillerSelect,
};

const defaultFiller = (fields = [], file = data.file) => {
  inputFiller(fields);

  const fileInput = document.querySelector("input[type='file']");

  if (!fileInput || !data.file) return;

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;

  const event = new Event("change", {
    bubbles: true,
    cancelable: false,
  });

  fileInput.dispatchEvent(event);
};

const matchSelectValue = (desiredValue, selectElem) => {
  if (!desiredValue || !selectElem) return null;
  const { options } = selectElem;
  const { value } =
    Array.from(options).find((option) => {
      if (option.innerText === desiredValue) {
        option.selected = true;
        return true;
      }
    }) || {};

  return value;
};

const updateElementValue = (element, value) => {
  element.value = value;
  element.innerText = value;

  try {
    element.dispatchEvent(new Event("change", { bubbles: true, cancelable: false }));
  } catch (error) {
    console.log("error", error);
  }
};

const inputFiller = (fields = []) => {
  const allLabels = Array.from(document.querySelectorAll("LABEL, LEGEND"));
  allLabels.map((label) => {
    const { htmlFor, innerText } = label;

    const { value } =
      fields.find(
        ({ name, aliases = [] }) =>
          innerText?.toLowerCase().includes(name?.toLowerCase()) ||
          aliases?.some((alias) => innerText?.toLowerCase().includes(alias?.toLowerCase()))
      ) || {};

    if (!value) return null;

    const input = htmlFor
      ? document.getElementById(htmlFor) || document.querySelector(`input[name="${htmlFor}"]`)
      : label?.querySelector("input[type='text'],input[type='email'],textarea") ||
        label?.parentNode.querySelector("input[type='text'],input[type='email'],textarea");

    const select = label?.querySelector("select");
    const indexSelect = select && matchSelectValue(value, select);

    if (!input && !select) return null;

    input && updateElementValue(input, value);

    if (select && indexSelect && autoFiller[data.url]) {
      autoFiller?.[data.url]?.(select, value);
    }

    return true;
  });
};

const defaultHandleMutation = (mutationList) => {
  if (data.isEnabled === false) return;

  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    const shouldNotUpdate = mutationList.some((mutationRecord) => {
      const { addedNodes, target } = mutationRecord;
      return (
        target.tagName === "INPUT" ||
        target.nodeName === "INPUT" ||
        target.nodeName === "SPAN" ||
        Array.from(addedNodes).filter(({ nodeName }) => {
          return nodeName === "#text" || nodeName === "INPUT";
        }).length
      );
    });
    if (shouldNotUpdate) return;

    return defaultFiller(data.fields);
  }, 300);
};

const observeMutations = ({ config, handleMutation, watchSelector = "" }) => {
  if (data.isEnabled === false) return;

  const watchSelectors = ["#root", "#__next", "body"];
  watchSelector && watchSelectors.unshift(watchSelector);
  const element = document.querySelector(watchSelectors.join(","));
  console.log("[element watched]", element);
  if (element) {
    const observer = new MutationObserver(handleMutation || defaultHandleMutation);
    const _config = config || {
      attributes: false,
      childList: true,
      subtree: true,
    };

    observer.observe(element, _config);

    if (element.tagName === "BODY" && !handleMutation) {
      defaultFiller(data.fields);
    }

    return observer;
  }
};

export { observeMutations, defaultFiller, matchSelectValue, inputFiller, updateElementValue };
