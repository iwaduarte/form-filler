import { data } from "../cacheData.js";

const config = {
  attributes: false,
  childList: true,
  subtree: false,
};

const handleMutation = (mutationList) => {
  console.log(mutationList);
  clearTimeout(data.timeoutId);
  data.timeoutId = setTimeout(() => {
    const shouldUpdate = mutationList.some((mutationRecord) => {
      const { addedNodes } = mutationRecord;
      const [newNode] = addedNodes || [];
      return newNode?.id === "headlessui-portal-root";
    });
    if (!shouldUpdate) return;
    console.log("filling textArea");
    filler(data.fields);
  }, 300);
};

const filler = (fields = []) => {
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

export { filler, config, handleMutation };
