import { data } from "../cacheData.js";

const config = {
  attributes: false,
  childList: true,
  subtree: false,
};

const handleMutation = (mutationList) => {
  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    const shouldUpdate = mutationList.some((mutationRecord) => {
      const { target } = mutationRecord;
      return (
        target.tagName !== "TEXTAREA" &&
        target.className === "route--Jobs Modal__open"
      );
    });
    if (!shouldUpdate) return;
    console.log("filling textArea");
    filler(data.store);
  }, 300);
};

const filler = (fields = []) => {
  const [textArea] = document.getElementsByTagName("textarea");

  if (!textArea) return;

  const { value } = fields.find((field) => field.name === "Good Fit") || {};
  if (!value) return;

  const userName = textArea?.placeholder?.replace(
    /Write a note to (.+) at.+/,
    "$1"
  );
  const message = value?.replace("#USER#", userName);

  textArea.value = message;
  textArea.innerHTML = message;
  textArea.dispatchEvent(new Event("change", { bubbles: true }));
};

export { filler, config, handleMutation };
