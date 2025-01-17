import { data } from "./cacheData.js";
import { autoFillerSelect } from "./Custom/greenHouse.js";

const autoFiller = {
  "boards.greenhouse.io": autoFillerSelect,
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
      if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent.trim()) {
        return {
          text: sibling.textContent.trim(),
          node: sibling,
        };
      }
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.textContent.trim()) {
        return {
          text: sibling.textContent.trim(),
          node: sibling,
        };
      }
      sibling = sibling.previousSibling;
    }
    current = current.parentElement;
  }

  return { text: "", node: null };
};

function isVisible(elem) {
  if (!elem) return false;
  const style = window.getComputedStyle(elem);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }
  return !(elem.offsetWidth <= 0 && elem.offsetHeight <= 0);
}

const getInputsAndLabels = () => {
  const form = document.querySelector("form");

  if (!form) return [];

  const allFields = form.querySelectorAll(
    "input:not([type=button]):not([type=submit]):not([type=reset]):not([type=hidden]), textarea, select"
  );
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

  if (!shouldUpdateFile) return;

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
  const allInputs = getInputsAndLabels();

  if (!allInputs.length) return false;

  return allInputs.map((label) => {
    const { text, element, type } = label;

    const { value } =
      fields.find(({ name, aliases = [] }) => text?.includes(name) || aliases?.some((alias) => text.includes(alias))) ||
      {};

    if (!value) return null;

    const input = type.includes("input_") && element;
    const select = type === "select" && element;

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
