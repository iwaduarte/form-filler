import { stripPunctuation } from "./utils.js";

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

  //removing search type
  const fieldSelector =
    "input:not([type=button]):not([type=submit]):not([type=reset]):not([type=hidden]):not([disabled]):not([type=search]), textarea, select";

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

/**
 * Dispatches the 'real' user-value change events so frameworks can see it.
 */
const updateElementValue = (element, value) => {
  element.focus();

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

  element.blur();
};

/**
 * Simulates selection on a real <select> element.
 * Matches either the "option.value" or option text content.
 */
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
  await new Promise((resolve) => setTimeout(resolve, 350));

  const matchedOption = containerEl.querySelector('[data-component-name="DropdownOption"]');

  if (matchedOption) dispatchClick(matchedOption);
};

const simulateCustomDropdown = (element, values) => {
  if (!element) return;

  const parentElement = element.parentElement;
  const parentElementClass = parentElement.classList[0];

  if (parentElementClass === "react-dropdown-select") {
    // 'react-dropdown-select'
    return simulateReactDropdownSelect(parentElement, "+" + values[0]);
  }

  // li - ul react type

  // 1) Open the dropdown. This can vary by implementation—sometimes you
  // just click the containerEl, sometimes you click a child trigger element.
  // Adjust the lines below to whichever approach your UI needs:
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  element.dispatchEvent(new MouseEvent("click", { bubbles: true }));

  // 2) Once open, we look for the <li> items (assuming they are within containerEl
  // or a sibling. If they are somewhere else, adjust your selector).
  const listItems = element.querySelectorAll("li");

  // 3) Try matching either data-value or text content to desiredValue
  for (const li of listItems) {
    // Example: if the HTML is something like <li data-value="55">Brazil (+55)</li>
    const dataVal = li.dataset.value || "";
    const textVal = li.textContent?.trim() || "";

    if (dataVal === values || textVal.toLowerCase().includes(values.toLowerCase())) {
      // simulate user clicking that <li>
      li.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      li.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      break;
    }
  }

  // Optionally you can blur or do more to "close" the dropdown if needed
  element.dispatchEvent(new MouseEvent("blur", { bubbles: true }));
};

/**
 * "High-level" function that tries to set the country code in either
 * a real <select> or a custom dropdown.
 */
const setCountryCode = (element, countryArray) => {
  const tag = element?.tagName?.toLowerCase() || "";

  if (tag === "select") {
    return matchSelectValue(element, countryArray);
  }
  // if (tag === "input") {
  //   return;
  // }
  //  Custom dropdown.
  return simulateCustomDropdown(element, countryArray);
};

export {
  findFirstTextAbove,
  isVisible,
  getInputsAndLabels,
  getTextIgnoringSelectsAndOptions,
  matchSelectValue,
  updateElementValue,
  setCountryCode,
};
