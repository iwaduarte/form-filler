import React, { useEffect, useState } from "react";

const Content = ({ fields = [] }) => {
  const [displayList, setDisplayList] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [menuPositionTop, setMenuPositionTop] = useState(500);
  const [menuPositionLeft, setMenuPositionLeft] = useState(500);

  const handleClickOutside = (e) => {
    const tagName = e.target.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea" || !displayList)
      return false;
    setDisplayList(false);
  };

  const handleListClick = (index) => {
    const { value } = fields[index] || {};
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

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [displayList]);

  useEffect(() => {
    const selectors = `input[type='text'],input[type='radio'],input[type='checkbox'],input[type='email'],input[type='number'],input[type='url'],input[type='tel'],textarea`;
    const allInputs = Array.from(document.querySelectorAll(selectors));
    allInputs.forEach((input) => {
      input.addEventListener("click", handleInputClick);
    });
    return () => {
      allInputs.forEach((input) => {
        input.removeEventListener("click", handleInputClick);
      });
    };
  }, [fields.length]);

  return displayList ? (
    <div
      style={{ top: menuPositionTop, left: menuPositionLeft }}
      className={`flex z-1000 bg-white  text-sm font-medium  text-gray-500 rounded-xl flex-wrap justify-center  content-between absolute`}
    >
      <ul className="cursor-pointer">
        {fields?.map(({ name, value }, index) => {
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
