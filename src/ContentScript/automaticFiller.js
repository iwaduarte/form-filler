import { data } from "./cacheData.js";
import { autoFillerSelect } from "./Custom/greenHouse.js";
import {
  getElementSignature,
  getInputsAndLabels,
  isVisible,
  matchSelectValue,
  setCountryCode,
  setInputFile,
  updateElementValue,
} from "./domUtils.js";
import { extractPhoneComponents, matchValues } from "./utils.js";

const autoFiller = {
  "boards.greenhouse.io": autoFillerSelect,
};
const elementsFilled = new Set();

const defaultFiller = async (fields = [], file = data.file) => {
  console.log("Default...");
  await inputFiller(fields);
};

const inputFiller = async (fields = []) => {
  const allInputs = getInputsAndLabels();
  console.log("allInputs", allInputs);

  if (!allInputs.length) return false;

  const phoneMap = {};
  const inputFile = [];

  const filteredInputs = allInputs.filter((element) => {
    const label = element.text?.toLowerCase() || "";
    const name = element.name?.toLowerCase() || "";

    const isLabelMatched = label.includes("phone") || label.includes("telefone") || name.includes("phone");
    const isNameMatched = name.includes("telefone") || name.includes("mobile");

    if (isLabelMatched || isNameMatched) {
      // For example "Mobile Phone" -> "mobile phone"
      // Or "Alternative Phone" -> "alternative phone"
      const key = isLabelMatched ? label.trim() : name.trim();
      phoneMap[key] = phoneMap[key] || [];
      const action = element.type.includes("input") ? "push" : "unshift";
      //custom
      if (element.element.parentElement.classList[0] === "react-tel-input") phoneMap[key][action](element);

      phoneMap[key][action](element);
      return false;
    }
    if (element.type === "input_file") {
      inputFile.push(element);
      return false;
    }
    return true;
  });

  console.log("phoneMap", phoneMap);

  await Promise.all(
    Object.keys(phoneMap).map(async (key, index) => {
      // avoid alternative phone selects
      if (index > 0) return;
      const [countryCodeObj, inputObj] = phoneMap[key];
      const { element: countryCodeElement } = countryCodeObj;
      const { element: inputElement } = inputObj || {};
      const phoneValue = matchValues("phone", fields);
      const _phoneValue = phoneValue[0] === "+" ? phoneValue.substring(1) : phoneValue;
      if (phoneMap[key].length === 1) return updateElementValue(phoneMap[key][0].element, _phoneValue);

      const { countryCode, country, phoneNumber } = extractPhoneComponents(phoneValue);
      const partialOrCompletePhone =
        inputElement.parentElement.classList[0] === "react-tel-input" ? "+" + _phoneValue : phoneNumber;

      await setCountryCode(countryCodeElement, [countryCode, country]);
      updateElementValue(inputElement, partialOrCompletePhone);
    })
  );

  const matchedInputs = filteredInputs
    .map((label) => {
      const { text, element, type, name } = label;
      const value = matchValues(text, fields) || matchValues(name, fields);

      if (!value) return null;

      const input = type.includes("input_");
      const select = type === "select";
      const isTextArea = type === "textarea";

      if (!input && !select && !isTextArea) return null;

      const indexSelect = select && matchSelectValue(value, element);

      if (input || isTextArea) updateElementValue(element, value);

      if (select && indexSelect && autoFiller[data.url]) {
        autoFiller?.[data.url]?.(select, value);
      }

      return true;
    })
    .filter(Boolean);

  inputFile.map((file) => {
    const { text, element, name } = file;
    setInputFile(element, data.file, text, name, matchedInputs.length);
  });
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

const defaultHandleMutation = (mutationList) => {
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

export { observeMutations, defaultFiller, inputFiller, updateFilledElements };
