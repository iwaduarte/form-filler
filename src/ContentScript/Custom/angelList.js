import { data } from "../cacheData.js";

const config = {
  attributes: false,
  childList: true,
  subtree: true,
};

const handleMutation = (mutationList) => {
  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    const shouldUpdate = mutationList.some((mutationRecord) => {
      const { target } = mutationRecord;
      return (
        target.tagName !== "TEXTAREA" &&
        (target.className === "styles_motionContainer__0bu1f" || target.className.includes("ReactModal__Content"))
      );
    });
    if (!shouldUpdate) return;
    const textArea = document.querySelector(".styles_modal__MFCOh textarea");
    if (!textArea) return;
    filler(data.fields);
  }, 600);
};

const filler = (fields = []) => {
  console.log("Filling textArea");
  const [textArea] = document.getElementsByTagName("textarea") || [];

  if (!textArea) return;

  const { value } = fields.find((field) => field.name === "Good Fit") || {};
  if (!value) return;

  const userName = textArea?.placeholder?.replace(/Write a note to (.+) at.+/, "$1");
  textArea.value = value?.replace("#USER#", userName);
  textArea.dispatchEvent(new Event("change", { bubbles: true }));
};

export { filler, config, handleMutation };
