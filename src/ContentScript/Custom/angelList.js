const config = {
  attributes: true,
  childList: true,
  subtree: true,
  attributeFilter: ["aria-hidden"],
};

const handleMutation = () => {
  setTimeout(() => {
    filler();
  }, 500);
};

const filler = (fields = []) => {
  const [textArea] = document.getElementsByTagName("textarea");
  if (!textArea) return;

  const { value } = fields.find((field) => field.name === "Good Fit") || {};
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
