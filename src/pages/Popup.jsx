import React, { Fragment, useState } from "react";
import reactLogo from "../assets/react.svg";
import closeSVG from "../assets/close.svg";
import trashSVG from "../assets/trash.svg";

const exampleNames = [
  { name: "First Name", value: "Iwá", match: "" },
  { name: "Last Name", value: "Duarte" },
  { name: "Email", value: "iwaduarte@gmail.com" },
];

const Popup = (props) => {
  const [inputs, setInputs] = useState(exampleNames);

  const handleAddProperties = () => {};

  return (
    <div className="w-screen py-6 px-5 md:px-10 bg-gray-100 shadow-md rounded-xl border text-gray-800 border-gray-400">
      <div className="flex justify-between mb-4">
        <h1 className="text-gray-800 font-lg font-bold tracking-normal leading-tight mb-4">
          Form-Filler
        </h1>
        <button
          className="cursor-pointer  text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out rounded focus:ring-2 focus:outline-none focus:ring-gray-600"
          aria-label="close modal"
          role="button"
        >
          <img src={closeSVG} />
        </button>
      </div>
      <div className="properties mb-8">
        <h1 className="text-gray-800 text-left font-lg font-bold tracking-normal leading-tight mb-4">
          Properties
        </h1>
        <ul>
          {inputs?.map((input, index) => {
            const { name, value } = input;
            return (
              <li
                key={index}
                className="flex flex-wrap justify-between py-2 border-y border-gray-300"
              >
                <div className="mr-2  text-left basis-24  font-bold ">
                  {name}:
                </div>
                <div className="basis-48 shrink-1 text-left"> {value}</div>
                <div className="w-[18px] shrink-1 text-right grow-0 cursor-pointer text-gray-200 hover:scale-105">
                  <img src={trashSVG} alt="Delete" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <label className="block text-left" htmlFor="name">
        <span className="text-gray-800 text-sm font-bold "> Field Name:</span>
        <input
          id="name"
          className="mb-5 mt-2 text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
          placeholder="(i.e Email, First Name, Last Name)"
        />
      </label>

      <label className="block text-left" htmlFor="name">
        <span className="text-gray-800 text-sm font-bold leading-tight tracking-normal">
          Field Value:
        </span>
        <input
          id="name"
          className="mb-5 mt-2 text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
          placeholder="(i.e Email, First Name, Last Name)"
        />
      </label>

      <div className="flex items-center justify-start w-full">
        <button
          onClick={handleAddProperties}
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 bg-indigo-700 rounded text-white px-8 py-2 text-sm"
        >
          Add
        </button>
        <button
          className="focus:outline-none focus:ring-2 focus:ring-offset-2  focus:ring-gray-400 ml-3 bg-gray-100 transition duration-150 text-gray-600 ease-in-out hover:border-gray-400 hover:bg-gray-300 border rounded px-8 py-2 text-sm"
          onClick="modalHandler()"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Popup;
