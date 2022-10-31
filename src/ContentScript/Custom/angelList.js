const angelListFiller = (fields = []) => {
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

export { angelListFiller };
