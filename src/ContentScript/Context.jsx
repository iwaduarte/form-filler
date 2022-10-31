import React, { useEffect, useRef, useState } from "react";
import { getFromStore, syncStore } from "../storage.js";
import Content from "./Content.jsx";
import AutomaticFiller from "./AutomaticFiller.jsx";

const Context = () => {
  const [fields, setFields] = useState([]);
  const [sync, setSync] = useState(false);
  const [reRender, setReRender] = useState(0);
  const fieldsLength = useRef(0);
  const timeout = useRef(null);
  const isEnabled = useRef(true);
  const handleForceRender = () => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      const selectors = `input[type='text'],input[type='radio'],input[type='checkbox'],input[type='email'],input[type='number'],input[type='url'],input[type='tel'],textarea`;
      const currentFieldsLength = document.querySelectorAll(selectors).length;
      if (currentFieldsLength > fieldsLength.current || c)
        setReRender((prev) => prev + 1);

      fieldsLength.current = currentFieldsLength;
    }, 2200);
  };

  useEffect(() => {
    syncStore(() => {
      setSync((prev) => !prev);
    });
  }, []);

  useEffect(() => {
    getFromStore(null).then((data) => {
      const { formFiller, isEnabled: _isEnabled } = data;
      isEnabled.current = _isEnabled;
      setFields(formFiller);
    });
  }, [sync]);

  useEffect(() => {
    const angelList = "#__next";
    const defaultReactApp = "#root";
    const reactRoot = document.querySelector(`${defaultReactApp},${angelList}`);
    console.log("reactRoot", reactRoot);
    if (reactRoot) {
      const observer = new MutationObserver(handleForceRender);
      const config = {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ["aria-hidden"],
      };
      observer.observe(reactRoot, config);

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return isEnabled.current ? (
    <>
      <Content fields={fields} reRender={reRender} />
      <AutomaticFiller fields={fields} reRender={reRender} />
    </>
  ) : null;
};

export default Context;
