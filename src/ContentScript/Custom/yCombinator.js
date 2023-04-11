import { data } from "../cacheData.js";

const config = {
  attributes: false,
  childList: true,
  subtree: false,
};

const shouldUpdate = (arrayList) => {
  return (arrayList || []).some((mutationRecord) => {
    const { addedNodes } = mutationRecord;
    const [newNode] = addedNodes || [];
    return newNode?.id === "headlessui-portal-root";
  });
};

const handleMutation = (mutationList) => {
  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    shouldUpdate(mutationList) && filler(data.fields);
  }, 300);
};

const filler = (fields = []) => {
  console.log("filling textArea yC");
  const modal = document.querySelector('[id^="headlessui-dialog-panel"]');
  const [textArea] = document.getElementsByTagName("textarea");

  const modalTitle = modal?.querySelector("div").innerText;

  if (!modalTitle || !textArea) return;

  const { value } = fields.find((field) => field.name === "Good Fit") || {};
  if (!value) return;

  const userName = modalTitle?.replace(/Reach out to (.+) at.+/, "$1");
  textArea.value = value?.replace("#USER#", userName);
  textArea.dispatchEvent(new Event("change", { bubbles: true }));
};

export { filler, shouldUpdate, handleMutation, config };
