import React, { useEffect, useState } from "react";

const exampleNames = [
  { name: "First Name", value: "Iwá", match: "" },
  { name: "Last Name", value: "Duarte" },
  { name: "Email", value: "iwaduarte@gmail.com" },
];
//it needs a css

const Content = ({ elem }) => {
  const [inputs] = useState(exampleNames);
  const [displayList, setDisplayList] = useState(false);
  const [targetElement, setTargetElement] = useState(null);
  const [menuPositionTop, setMenuPositionTop] = useState(500);
  const [menuPositionLeft, setMenuPositionLeft] = useState(500);

  const handleListClick = (index) => {
    const { value } = inputs[index] || {};
    if (!targetElement || !value) return false;
    targetElement.innerHTML = value;
    setDisplayList(false);
  };
  const handleInputClick = (e) => {
    setTargetElement(e.target);
    setMenuPositionLeft(e.pageX + 5);
    setMenuPositionTop(e.pageY + 5);
    setDisplayList(true);
  };

  useEffect(() => {
    console.log("VAMOOOOOOOOOOOOOOO");
    const allInputs = Array.from(document.querySelectorAll("input,textarea"));
    allInputs.forEach((input, index) => {
      input.addEventListener("click", handleInputClick);
    });
    return () => {
      allInputs.forEach((input) => {
        input.removeEventListener("click", handleInputClick);
      });
    };
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
