import React, { useEffect, useState } from "react";

const Content = ({ fields = [], reRender }) => {
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
    const allInputs = Array.from(document.querySelectorAll("input,textarea"));
    document.addEventListener("click", handleClickOutside);
    allInputs.forEach((input) => {
      input.addEventListener("click", handleInputClick);
    });
    return () => {
      allInputs.forEach((input) => {
        input.removeEventListener("click", handleInputClick);
      });
      document.removeEventListener("click", handleClickOutside);
    };
  }, [reRender, fields.length]);

  return displayList ? (
    <div
      style={{ top: menuPositionTop, left: menuPositionLeft }}
      className={`flex bg-white  text-sm font-medium  text-gray-500 rounded-xl flex-wrap justify-center  content-between absolute`}
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
