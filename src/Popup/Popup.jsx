import React, { useEffect, useState } from "react";
import trashSVG from "./assets/trash.svg";
import { getFromStore, setStore } from "../storage.js";

const addProperty = async (data) => {
  const { name, value } = data || {};
  const storedItem = (await getFromStore()) || [];
  if (!name || !value) return storedItem;
  const newData = [...storedItem, data];
  await setStore(newData);
  return newData;
};

const deleteProperty = async (index) => {
  const storedItem = (await getFromStore()) || [];
  storedItem.splice(index, 1);
  await setStore(storedItem);

  return storedItem;
};

const Popup = () => {
  const [inputs, setInputs] = useState([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  const handleChange = async (e) => {
    const setInputValue = {
      toggle: setIsEnabled,
      name: setName,
      value: setValue,
    };
    const { id, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (type === "checkbox") await setStore(checked, "isEnabled");
    setInputValue[id](newValue);
  };
  const handleClear = () => {
    setName("");
    setValue("");
  };
  const handleAddProperty = async () => {
    setInputs(await addProperty({ name, value }));
    handleClear();
  };
  const handleDeleteProperty = async (index) => {
    setInputs(await deleteProperty(index));
  };

  useEffect(() => {
    getFromStore(null).then((data) => {
      const { formFiller = [], isEnabled: _isEnabled = true } = data;
      setIsEnabled(_isEnabled);
      setInputs(formFiller);
    });
  }, [inputs.length]);

  return (
    <div className=" py-6 px-5 md:px-10 bg-gray-100 shadow-md rounded-xl border text-gray-800 border-gray-400">
      <div className="flex justify-between mb-4">
        <h1 className="text-gray-800 font-lg font-bold tracking-normal leading-tight mb-4">
          Form-Filler
        </h1>

        <div className="flex items-center">
          <span className="mr-1">OFF</span>
          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
            <input
              id="toggle"
              type="checkbox"
              name="toggle"
              checked={isEnabled}
              onChange={handleChange}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="toggle"
              className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer text-xs text-gray-700"
            ></label>
          </div>
          <span className="ml-1">ON</span>
        </div>
      </div>
      <div className="properties mb-8 ">
        <h1 className="text-gray-800 text-left font-lg font-bold tracking-normal leading-tight mb-4">
          Properties
        </h1>
        <ul className="flex flex-col self-center h-[38vh] overflow-y-auto">
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
                <div
                  className="w-[18px] shrink-1 text-right grow-0 cursor-pointer text-gray-200 hover:scale-105"
                  onClick={() => handleDeleteProperty(index)}
                >
                  <img src={trashSVG} alt="Delete" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="">
        <label className="block text-left" htmlFor="name">
          <span className="text-gray-800 text-sm font-bold "> Field Name:</span>
          <input
            id="name"
            value={name}
            onChange={handleChange}
            className="mb-5 mt-2 text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
            placeholder="(i.e Email, First Name, Last Name)"
          />
        </label>

        <label className="block text-left" htmlFor="name">
          <span className="text-gray-800 text-sm font-bold leading-tight tracking-normal">
            Field Value:
          </span>
          <input
            id="value"
            value={value}
            onChange={handleChange}
            className="mb-5 mt-2 text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
            placeholder="(i.e Email, First Name, Last Name)"
          />
        </label>
      </div>
      <div className="flex items-center justify-start w-full">
        <button
          onClick={handleAddProperty}
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 bg-indigo-700 rounded text-white px-8 py-2 text-sm"
        >
          Add
        </button>
        <button
          className="focus:outline-none focus:ring-2 focus:ring-offset-2  focus:ring-gray-400 ml-3 bg-gray-100 transition duration-150 text-gray-600 ease-in-out hover:border-gray-400 hover:bg-gray-300 border rounded px-8 py-2 text-sm"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Popup;
