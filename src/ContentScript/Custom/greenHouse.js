// greenhouse.io has jQuery and its select options only updates a "hidden" input and a span.
// This update the span so the user can see the value selected.

const autoFillerSelect = (element, value) => {
  const span = element.parentNode.querySelector("div > a > span");
  span.innerText = value;
  span.value = value;
};

export { autoFillerSelect };
