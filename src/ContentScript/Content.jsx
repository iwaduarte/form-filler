import React, { useEffect, useRef, useState } from "react";
import { getFromStore, syncStore } from "../storage.js";

const Content = () => {
  const [inputs, setInputs] = useState([]);
  const [sync, setSync] = useState(false);
  const [displayList, setDisplayList] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [menuPositionTop, setMenuPositionTop] = useState(500);
  const [menuPositionLeft, setMenuPositionLeft] = useState(500);
  const [reRender, setReRender] = useState(0);
  const inputsLength = useRef(0);

  const handleClickOutside = (e) => {
    const tagName = e.target.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea" || !displayList)
      return false;
    setDisplayList(false);
  };

  const handleListClick = (index) => {
    const { value } = inputs[index] || {};
    if (!targetElement || !value) return false;
    targetElement.innerHTML = value;
    targetElement.value = value;
    setDisplayList(false);
  };
  const handleInputClick = (e) => {
    setTargetElement(e.target);
    setMenuPositionLeft(e.pageX + 5);
    setMenuPositionTop(e.pageY + 5);
    setDisplayList(true);
  };
  const handleForceRender = () => {
    const currentInputsLength =
      document.querySelectorAll("input,textarea").length;

    if (
      currentInputsLength > 0 &&
      currentInputsLength >= inputsLength.current
    ) {
      inputsLength.current = currentInputsLength;
      setReRender((prev) => prev + 1);
    }
  };

  useEffect(() => {
    syncStore(() => {
      setSync((prev) => !prev);
    });
  }, []);

  useEffect(() => {
    getFromStore().then((data) => {
      setInputs(data);
    });
  }, [inputs.length, sync]);

  useEffect(() => {
    const allInputs = Array.from(document.querySelectorAll("input,textarea"));
    inputsLength.current = allInputs.length;

    document.addEventListener("click", handleClickOutside);
    allInputs.forEach((input, index) => {
      input.addEventListener("click", handleInputClick);
    });

    return () => {
      allInputs.forEach((input) => {
        input.removeEventListener("click", handleInputClick);
      });
      document.removeEventListener("click", handleClickOutside);
    };
  }, [displayList, reRender]);

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

  return displayList ? (
    <div
      style={{ top: menuPositionTop, left: menuPositionLeft }}
      className={`flex bg-white  text-sm font-medium  text-gray-500 rounded-xl flex-wrap justify-center content-between absolute`}
    >
      <ul className="cursor-pointer">
        {inputs?.map(({ name, value }, index) => {
          return (
            <li
              key={index}
              className="py-2 px-3 first:rounded-t-xl border-b border-gray-200   last:rounded-b-xl hover:bg-blue-700 hover:text-white "
              onClick={() => handleListClick(index)}
            >
              {name}
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;
};

export default Content;
