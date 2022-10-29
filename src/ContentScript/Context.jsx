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
      const currentFieldsLength =
        document.querySelectorAll("input,textarea").length;
      if (currentFieldsLength > fieldsLength.current)
        setReRender((prev) => prev + 1);

      fieldsLength.current = currentFieldsLength;
    }, 500);
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
    const reactRoot = document.getElementById("root");
    if (reactRoot) {
      const observer = new MutationObserver(handleForceRender);

      const config = { attributes: false, childList: true, subtree: true };
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
