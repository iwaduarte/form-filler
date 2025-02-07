import { stripPunctuation } from "./utils.js";
import { data } from "./cacheData.js";

/**
 * Finds the first non-empty text above `elem` by traversing previous siblings
 * and, if needed, moving up to the parent and continuing from its previous siblings.
 * Returns an object:
 *   {
 *     text: <string>,      // The actual text found
 *     node: <DOM Node>     // Where the text was found (could be a text node or an element)
 *   }
 */
const findFirstTextAbove = (elem, maxDepth = 5) => {
  let current = elem;
  let depth = 0;

  while (current && depth < maxDepth) {
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
        console.log(strippedText);

        if (strippedText.length > 0) {
          return {
            text: rawText.substring(0, 120), // Or use strippedText if you prefer to return the cleaned version
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
            return { text: rawText.substring(0, 120), node: sibling };
          }
        }
      }
      sibling = sibling.previousSibling;
    }
    current = current.parentElement;
    depth++; // Increment depth at each parent level
  }

  return { text: "", node: null };
};

const isVisible = (elem) => {
  if (!elem) return false;
  if (elem.type === "file") return true;
  const style = window.getComputedStyle(elem);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }
  return !(elem.offsetWidth <= 0 && elem.offsetHeight <= 0);
};

const getInputsAndLabels = () => {
  const forms = document.querySelectorAll("form");

  //removing search type
  const fieldSelector =
    "input:not([type=button]):not([type=checkbox]):not([type=submit]):not([type=reset]):not([type=hidden]):not([disabled]):not([type=search]):not([type=password]), textarea:not([inputmode='none']):not([aria-readonly='true']), select";

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

const updateElementValue = (element, value) => {
  // If the element has a native "value" property (e.g. real input),
  // we force-set it using the native setter, then dispatch events:
  const nativeSetter = Object.getOwnPropertyDescriptor(element.__proto__, "value")?.set;

  if (nativeSetter) {
    nativeSetter.call(element, value);
  } else {
    // fallback if we can’t get the native setter
    element.value = value;
    element.innerText = value;
  }

  // Fire events typically listened for by frameworks
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
};

const matchSelectValue = (selectEl, values) => {
  if (!selectEl || !values.length) return null;

  selectEl.focus();

  const matchedOption = Array.from(selectEl.options).find((opt) =>
    values?.some((value) => opt.value === value || opt.textContent.trim().includes(value))
  );

  if (matchedOption) {
    matchedOption.selected = true;
    // Dispatch change so React/Vue/Angular picks it up
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    console.log(`Selected option: ${matchedOption.value}`);
  }
  selectEl.blur();
  return matchedOption?.value;
};

const dispatchClick = (target) => {
  if (!target) return;
  target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
};

const simulateReactDropdownSelect = async (containerEl, value) => {
  console.log("react-dropdown-select");

  if (!containerEl) return;

  dispatchClick(containerEl);

  await new Promise((resolve) => setTimeout(resolve, 200));
  const searchInput = containerEl.querySelector('[data-component-name="DropdownOptionsSearch"] input');

  if (searchInput) {
    searchInput.focus();
    const nativeSetter = Object.getOwnPropertyDescriptor(searchInput.__proto__, "value")?.set;
    if (nativeSetter) {
      nativeSetter.call(searchInput, value);
    } else {
      searchInput.value = value;
    }
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    searchInput.dispatchEvent(new Event("change", { bubbles: true }));
    searchInput.blur();
  }
  await new Promise((resolve) => setTimeout(resolve, 500));

  const matchedOption = containerEl.querySelector('[data-component-name="DropdownOption"]');

  if (matchedOption) dispatchClick(matchedOption);
};

const simulateReactPhoneInput2Select = async (element, values) => {
  console.log("react-tel-input");
  const [, country] = values;
  const flagElement = element.nextElementSibling.children[0];
  dispatchClick(flagElement);
  await new Promise((resolve) => setTimeout(resolve, 200));
  const listItems = element.parentElement.querySelectorAll("li.country");

  for (const li of listItems) {
    const countryCode = li.dataset?.countryCode.toLowerCase() || "";
    if (country.toLowerCase() === countryCode) {
      dispatchClick(li);
      break;
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
};

const setCountryCode = (element, countryArray) => {
  if (!element) return;

  const tag = element?.tagName?.toLowerCase() || "";

  if (tag === "select") {
    return matchSelectValue(element, countryArray);
  }

  //  Custom dropdown for different select strategies libraries
  //  (div's, input searches, lists (ul))
  const parentElement = element.parentElement;
  const parentElementClass = parentElement.classList[0];

  // 'react-dropdown-select'
  if (parentElementClass === "react-dropdown-select")
    return simulateReactDropdownSelect(parentElement, "+" + countryArray[0]);

  if (parentElementClass === "react-tel-input") return simulateReactPhoneInput2Select(element, countryArray);
};

const getElementSignature = (el) => {
  // Start with the lowercase tagName, e.g. "input"
  const str = el.tagName.toLowerCase();
  // If the element has an ID, append it like "#my-id"
  const id = el.id ? "#" + el.id : "";
  // If there are classes, append them like ".class1.class2"
  const classes = el.classList && el.classList.length ? "." + Array.from(el.classList).join(".") : "";
  // Optionally, you might include the 'name' attribute or anything else
  const name = el.name ? `[name="${el.name}"]` : "";
  // Return the custom string
  return str + id + classes + name;
};

const setInputFile = (fileInput, file, text, name, matchedLength) => {
  const _text = text.toLowerCase();
  const _name = name.toLowerCase();
  const shouldUpload =
    _text?.includes("resume") ||
    _text?.includes("currículo") ||
    _text?.includes("cv") ||
    _name?.includes("resume") ||
    _name?.includes("currículo") ||
    _name?.includes("cv") ||
    matchedLength > 2;

  if (!shouldUpload || !fileInput || !file) return;

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;

  const event = new Event("change", {
    bubbles: true,
    cancelable: false,
  });

  fileInput.dispatchEvent(event);
};

export {
  findFirstTextAbove,
  isVisible,
  getInputsAndLabels,
  getTextIgnoringSelectsAndOptions,
  matchSelectValue,
  updateElementValue,
  setCountryCode,
  getElementSignature,
  setInputFile,
};
