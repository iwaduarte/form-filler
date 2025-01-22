import { data } from "./cacheData.js";
import { autoFillerSelect } from "./Custom/greenHouse.js";

const autoFiller = {
  "boards.greenhouse.io": autoFillerSelect,
};

const stripPunctuation = (text) => {
  return text.replace(/[^a-zA-Z0-9À-ž\s]+/g, "").trim();
};

const getTextIgnoringSelectsAndOptions = (element) => {
  let result = "";
  // Loop through all child nodes (both elements and text nodes)
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Plain text node => add to result
      result += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // If the element is <select> or <option>, skip it entirely
      if (node.nodeName.toLowerCase() === "select" || node.nodeName.toLowerCase() === "option") {
        continue;
      }
      // Otherwise, recurse into children
      result += getTextIgnoringSelectsAndOptions(node);
    }
  }
  return result;
};

/**
 * Finds the first non-empty text above `elem` by traversing previous siblings
 * and, if needed, moving up to the parent and continuing from its previous siblings.
 * Returns an object:
 *   {
 *     text: <string>,      // The actual text found
 *     node: <DOM Node>     // Where the text was found (could be a text node or an element)
 *   }
 */
const findFirstTextAbove = (elem) => {
  let current = elem;

  while (current) {
    let sibling = current.previousSibling;
    while (sibling) {
      if (sibling.nodeType === Node.TEXT_NODE) {
        // Skip if it's empty after trim
        if (!sibling.textContent.trim()) {
          sibling = sibling.previousSibling;
          continue;
        }

        // Skip if parent is <select> or <option>
        const parentTag = sibling.parentElement?.nodeName.toLowerCase();
        if (parentTag === "select" || parentTag === "option") {
          sibling = sibling.previousSibling;
          continue;
        }

        const rawText = sibling.textContent.trim();
        const strippedText = stripPunctuation(rawText);

        if (strippedText.length > 0) {
          return {
            text: rawText, // Or use strippedText if you prefer to return the cleaned version
            node: sibling,
          };
        }
      }
      if (sibling.nodeType === Node.ELEMENT_NODE) {
        const tag = sibling.nodeName.toLowerCase();
        // Skip <option> elements
        // Skip if this element is <select> or <option>
        if (tag === "select" || tag === "option") {
          sibling = sibling.previousSibling;
          continue;
        }

        // Otherwise, let's get *partial* text ignoring <select>/<option> inside
        const rawText = getTextIgnoringSelectsAndOptions(sibling).trim();
        if (rawText) {
          const stripped = stripPunctuation(rawText);
          if (stripped.length > 0) {
            return { text: rawText, node: sibling };
          }
        }
      }
      sibling = sibling.previousSibling;
    }
    current = current.parentElement;
  }

  return { text: "", node: null };
};

const isVisible = (elem) => {
  if (!elem) return false;
  const style = window.getComputedStyle(elem);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }
  return !(elem.offsetWidth <= 0 && elem.offsetHeight <= 0);
};

const getInputsAndLabels = () => {
  const forms = document.querySelectorAll("form");

  const fieldSelector =
    "input:not([type=button]):not([type=submit]):not([type=reset]):not([type=hidden]):not([disabled]), textarea, select";

  const documentFields = [...document.querySelectorAll(fieldSelector)];
  const formFields = forms.length ? [...forms].flatMap((form) => [...form.querySelectorAll(fieldSelector)]) : [];

  const allFieldsSet = new Set([...documentFields, ...formFields]);

  const allFields = [...allFieldsSet];

  const visibleFields = Array.from(allFields).filter((field) => isVisible(field));
  const elements = visibleFields.map((field) => {
    const nameAttr = field.getAttribute("name") || "";
    // For <input> let's get type=..., for <textarea>/<select> let's just say "textarea" or "select"
    const fieldTag = field.tagName.toLowerCase();
    const fieldType = fieldTag === "input" ? "input_" + (field.getAttribute("type") || "text") : fieldTag;

    const { text, node } = findFirstTextAbove(field);

    // If the text is in an element node, we can store it directly; if it’s a text node, no "surroundingElement"
    const surroundingTextElement = node && node.nodeType === Node.ELEMENT_NODE ? node : null;

    return {
      element: field,
      name: nameAttr,
      type: fieldType,
      text,
      surroundingTextElement,
    };
  });

  if (elements.length === 1 && elements[0].type === "input_file") {
    return [];
  }
  return elements;
};

const defaultFiller = (fields = [], file = data.file) => {
  console.log("Default...");

  const shouldUpdateFile = inputFiller(fields);

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

const matchSelectValue = (desiredValue, selectElem) => {
  if (!desiredValue || !selectElem) return null;
  const { options } = selectElem;
  const foundOption = Array.from(options).find(
    (option) => option.innerText === desiredValue || option.value === desiredValue
  );
  if (foundOption) {
    foundOption.selected = true;
    selectElem.dispatchEvent(new Event("change", { bubbles: true, cancelable: false }));
    console.log(`Selected option: ${foundOption.innerText}`);
    return foundOption.value;
  }
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

const escapeRegExp = (string) => string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");

const matchesWholeWord = (text, word) => {
  if (!text || !word) return false;
  const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
  return pattern.test(text);
};

const inputFiller = (fields = []) => {
  const allInputs = getInputsAndLabels();
  console.log(allInputs);

  if (!allInputs.length) return false;

  return allInputs
    .map((label) => {
      const { text, element, type } = label;

      const { value } =
        fields.find(({ name, aliases = [] }) => {
          // Check if text contains "name" as a whole word
          if (matchesWholeWord(text, name)) {
            return true;
          }
          // Or check any of the aliases
          return aliases.some((alias) => matchesWholeWord(text, alias));
        }) || {};

      if (!value) return null;

      const input = type.includes("input_") && element;
      const select = type === "select" && element;

      if (!input && !select) return null;

      const indexSelect = select && matchSelectValue(value, select);

      input && updateElementValue(input, value);

      if (select && indexSelect && autoFiller[data.url]) {
        autoFiller?.[data.url]?.(select, value);
      }

      return true;
    })
    .filter(Boolean);
};

const defaultHandleMutation = (mutationList) => {
  if (data.isEnabled === false) return;

  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    const shouldNotUpdate = mutationList.some((mutationRecord) => {
      const { addedNodes, target } = mutationRecord;
      const isInsideForm = target.closest("form") !== null;
      return (
        isInsideForm ||
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
      defaultFiller(data.fields);
    }

    return observer;
  }
};

export { observeMutations, defaultFiller, matchSelectValue, inputFiller, updateElementValue };
