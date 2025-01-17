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
const filler = (fields = [], element) => {
  console.log("[Wellfound] Filling textArea");
  const textArea = element || document.querySelector(".styles_modal__MFCOh textarea");
  if (!textArea) return;

  const startupName = document.querySelector(".styles_startup__b9n5O")?.textContent;
  const questions = document.querySelector(".styles_modal__MFCOh label div")?.textContent;

  const { value } =
    fields.find((field) => (questions ? questions.includes(field.name) : field.name === "Good Fit")) || {};
  if (!value) return console.log("[Wellfound] Missing Property");

  const userName = textArea?.placeholder?.replace(/Write a note to (\w+).+/, "$1") + " recruiter";
  textArea.value = value?.replace("#USER#", userName);
  textArea.dispatchEvent(new Event("change", { bubbles: true }));
};

const handleMutation = (mutationList) => {
  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    const element = shouldUpdate(mutationList);
    element && filler(data.fields, element);
  }, 600);
};

export { filler, shouldUpdate, config, handleMutation };
