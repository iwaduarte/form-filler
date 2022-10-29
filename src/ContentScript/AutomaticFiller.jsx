import React, { useEffect } from "react";

const AutomaticFiller = ({ fields, reRender }) => {
  useEffect(() => {
    const allLabels = Array.from(document.getElementsByTagName("LABEL"));

    allLabels.map((label) => {
      const { htmlFor, innerText } = label;

      const { value } =
        fields.find(({ name }) =>
          innerText.toLowerCase().includes(name.toLowerCase())
        ) || {};

      const _input = htmlFor
        ? document.getElementById(htmlFor)
        : label.querySelector("input[type='text'],input[type='email']");

      const input =
        _input || document.querySelector(`input[name="${htmlFor}"]`);

      if (!value || !input) return null;

      input.value = value;
      input.innerHTML = value;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeInputValueSetter.call(input, value);
      input.dispatchEvent(new Event("change", { bubbles: true }));

      return input;
    });
  }, [fields.length, reRender]);

  return null;
};

export default AutomaticFiller;
