import React, { useEffect, useRef, useState } from "react";
import { getFromStore, syncStore } from "../storage.js";
import Content from "./Content.jsx";

const Context = ({ fields: _fields, isEnabled: isEnabledInitial }) => {
  const [fields, setFields] = useState(_fields);
  const [sync, setSync] = useState(false);
  const isEnabled = useRef(isEnabledInitial);

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

  return isEnabled.current ? <Content fields={fields} /> : null;
};

export default Context;
