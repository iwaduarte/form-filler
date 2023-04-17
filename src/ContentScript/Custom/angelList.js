import { data } from "../cacheData.js";

const config = {
  attributes: false,
  childList: true,
  subtree: true,
};

const shouldUpdate = (arrayList) => {
  const containsTag = arrayList.some((mutationRecord) => {
    const { target } = mutationRecord;
    return (
      target.tagName !== "TEXTAREA" &&
      (target.className === "styles_motionContainer__0bu1f" || target.className.includes("ReactModal__Content"))
    );
  });
  if (!containsTag) return false;

  return document.querySelector(".styles_modal__MFCOh textarea");
};
const filler = (fields = []) => {
  console.log("[Wellfound] Filling textArea");
  const [textArea] = Array.from(document.getElementsByTagName("textarea")).filter((e) => e.id);

  if (!textArea) return;

  const { value } = fields.find((field) => field.name === "Good Fit") || {};
  if (!value) return console.log("[Wellfound] Missing Property - Good Fit");

  const userName = textArea?.placeholder?.replace(/Write a note to (.+) at.+/, "$1");
  textArea.value = value?.replace("#USER#", userName);
  textArea.dispatchEvent(new Event("change", { bubbles: true }));
};

const handleMutation = (mutationList) => {
  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    shouldUpdate(mutationList) && filler(data.fields);
  }, 600);
};

export { filler, shouldUpdate, config, handleMutation };
