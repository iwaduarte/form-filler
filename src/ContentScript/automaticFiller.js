import { data } from "./cacheData.js";
import { autoFillerSelect } from "./Custom/greenHouse.js";
import {
  getElementSignature,
  getInputsAndLabels,
  isVisible,
  matchSelectValue,
  setInputFile,
  setLocation,
  setPhoneAndCountry,
  updateElementValue,
} from "./domUtils.js";
import { matchValues } from "./utils.js";

const autoFiller = {
  "boards.greenhouse.io": autoFillerSelect,
};
const elementsFilled = new Set();

const ashByHQ = "_inputContainer_v5ami_28";
const greenHouse = ["select__input-container", "select-shell"];
const lever = "application-field";
const rippling = "css-12m8htv-StyledBaseInputContainer-InputContainer";
const locationSelectors = [ashByHQ, ...greenHouse, lever, rippling];

const defaultFiller = async (fields = []) => {
  console.log("Default...");

  const allInputs = getInputsAndLabels();
  console.log("allInputs", allInputs);

  if (!allInputs.length) return false;

  const phoneMap = {};
  const inputFile = [];
  const locationList = [];

  const filteredInputs = allInputs.filter((elementObj) => {
    const { text, name: _name, element, type } = elementObj;
    const label = text?.toLowerCase() || "";
    const name = _name?.toLowerCase() || "";

    const isLabelMatched = label.includes("phone") || label.includes("telefone") || name.includes("phone");
    const isNameMatched = name.includes("telefone") || name.includes("mobile");

    // filter out phone inputs
    if (isLabelMatched || isNameMatched) {
      // For example "Mobile Phone" -> "mobile phone"
      // Or "Alternative Phone" -> "alternative phone"
      const key = isLabelMatched ? label.trim() : name.trim();
      phoneMap[key] = phoneMap[key] || [];
      const action = type.includes("input") ? "push" : "unshift";
      //custom
      if (element.parentElement.classList[0] === "react-tel-input") phoneMap[key][action](elementObj);

      phoneMap[key][action](elementObj);
      return false;
    }
    // filter out file inputs
    if (type === "input_file") {
      inputFile.push(elementObj);
      return false;
    }
    // filter out location inputs
    if (
      (label.includes("location") || label.includes("city, state, and country")) &&
      locationSelectors.includes(element?.parentElement?.classList[0])
    ) {
      locationList.push(elementObj);
      return false;
    }
    return true;
  });

  const [key] = Object.keys(phoneMap);
  const [location] = locationList;
  const [firstFile, secondFile] = inputFile;

  const matchedInputs = filteredInputs
    .map((label) => {
      const { text, element, type, name } = label;
      const value = matchValues(text, fields) || matchValues(name, fields);

      if (!value) return null;

      const input = type.includes("input_");
      const select = type === "select";
      const isTextArea = type === "textarea";

      if (!input && !select && !isTextArea) return null;

      const indexSelect = select && matchSelectValue(element, [value]);

      if (input || isTextArea) updateElementValue(element, value);

      if (select && indexSelect && autoFiller[data.url]) {
        autoFiller?.[data.url]?.(select, value);
      }

      return true;
    })
    .filter(Boolean);

  await Promise.all([
    setLocation(location, fields),
    setPhoneAndCountry(phoneMap[key], fields),
    setInputFile(firstFile?.element, data.file, firstFile?.text, firstFile?.name, matchedInputs?.length),
    setInputFile(secondFile?.element, data.file, secondFile?.text, secondFile?.name, matchedInputs?.length),
  ]).catch((err) => console.log(err));
};

const updateFilledElements = () => {
  const formElements = document.querySelectorAll(
    "input:not([type=button]):not([type=checkbox]):not([type=submit]):not([type=reset]):not([type=hidden]):not([disabled]):not([type=search]), textarea:not([inputmode='none']):not([aria-readonly='true']), select"
  );

  return Array.from(formElements).reduce((acc, element) => {
    const elIdentifier = getElementSignature(element);
    if (!elementsFilled.has(elIdentifier) && isVisible(element)) {
      elementsFilled.add(elIdentifier);
      return true;
    }
    return acc;
  }, false);
};

const defaultHandleMutation = () => {
  if (data.isEnabled === false) return;
  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    const shouldUpdate = updateFilledElements();
    if (!shouldUpdate) return;
    return defaultFiller(data.fields);
  }, 300);
};

const observeMutations = ({ config, handleMutation, watchSelector = "" }) => {
  if (data.isEnabled === false) return;

  const watchSelectors = ["#root", "#__next", "body"];
  if (watchSelector) watchSelectors.unshift(watchSelector);

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
      updateFilledElements();
      return defaultFiller(data.fields);
    }

    return observer;
  }
};

export { observeMutations, defaultFiller, updateFilledElements };
