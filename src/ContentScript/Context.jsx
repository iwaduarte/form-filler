import React, { useEffect, useRef, useState } from "react";
import { getFromStore, syncStore } from "../storage.js";
import Content from "./Content.jsx";
import { data as cache } from "./cacheData.js";

const Context = ({
  fields: _fields,
  isEnabled: isEnabledInitial,
  whiteListed: whiteListedInitial = false,
  url = null,
}) => {
  const [fields, setFields] = useState(_fields);
  const [sync, setSync] = useState(false);
  const isEnabled = useRef(isEnabledInitial);
  const isWhiteListed = useRef(whiteListedInitial);

  useEffect(() => {
    syncStore(() => {
      setSync((prev) => !prev);
    });
  }, []);

  useEffect(() => {
    getFromStore(null).then((data) => {
      const {
        formFiller,
        isEnabled: isEnabledFromStore,
        whiteList = {},
      } = data;

      isEnabled.current = isEnabledFromStore;
      isWhiteListed.current = { ...cache.whiteList, ...whiteList }[url];
      setFields(formFiller);
    });
  }, [sync]);

  return isEnabled.current && isWhiteListed.current ? (
    <Content fields={fields} />
  ) : null;
};

export default Context;
