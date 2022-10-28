import React, { useEffect, useState } from "react";
import { getFromStore, syncStore } from "../storage.js";

const AutomaticFiller = (props) => {
  const [fields, setFields] = useState([]);
  const [sync, setSync] = useState(false);

  useEffect(() => {
    syncStore(() => {
      setSync((prev) => !prev);
    });
  }, []);
  useEffect(() => {
    getFromStore().then((data) => {
      setFields(data);
    });
  }, [fields.length, sync]);

  useEffect(() => {
    const allLabels = Array.from(document.getElementsByTagName("LABEL"));
    allLabels.map((label) => {
      const { htmlFor, innerText } = label;

      const { value } =
        fields.find(({ name, value }) =>
          innerText.toLowerCase().includes(name.toLowerCase())
        ) || {};

      const _input = htmlFor
        ? document.getElementById(htmlFor)
        : label.querySelector("input[type='text'],input[type='email']");

      const input =
        _input || document.querySelector(`input[name="${htmlFor}"]`);

      if (!value || !input) return null;

      input.innerHTML = value;
      input.value = value;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return input;
    });
  }, [fields.length]);

  return null;
};

export default AutomaticFiller;
