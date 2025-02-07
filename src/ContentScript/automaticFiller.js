import { data } from "./cacheData.js";
import { autoFillerSelect } from "./Custom/greenHouse.js";
import {
  findFirstTextAbove,
  getElementSignature,
  getInputsAndLabels,
  isVisible,
  matchSelectValue,
  setCountryCode,
  updateElementValue,
} from "./domUtils.js";
import { extractPhoneComponents, matchValues } from "./utils.js";

const autoFiller = {
  "boards.greenhouse.io": autoFillerSelect,
};
const elementsFilled = new Set();

const defaultFiller = async (fields = [], file = data.file) => {
  console.log("Default...");

  const shouldUpdateFile = await inputFiller(fields);

  if (!shouldUpdateFile || !shouldUpdateFile.length) return;

  const fileInput = document.querySelector("input[type='file']");
  const { text = "" } = findFirstTextAbove(fileInput) || {};
  const firstText = text.toLowerCase();
  const fileInputName = fileInput.name ? fileInput.name.toLowerCase() : "";
  const MINIMUM_SIZE_ACCEPTABLE_FOR_UPDATE = 4;

  if (
    !fileInputName?.includes("resume") &&
    !fileInputName?.includes("cv") &&
    !fileInputName?.includes("currículo") &&
    !firstText?.includes("resume") &&
    !firstText?.includes("currículo") &&
    !firstText?.includes("cv") &&
    shouldUpdateFile.length < MINIMUM_SIZE_ACCEPTABLE_FOR_UPDATE
  )
    return;

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

const inputFiller = async (fields = []) => {
  const allInputs = getInputsAndLabels();
  // console.log("allInputs", allInputs);

  if (!allInputs.length) return false;

  const phoneMap = {};

  console.log(allInputs);

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

  return filteredInputs
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
