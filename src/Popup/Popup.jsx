import React, { useEffect, useState } from "react";
import trashSVG from "./assets/trash.svg";
import arrowSVG from "./assets/arrow.svg";
import formFiller from "./assets/form-filler.png";

import { addProperty, deleteProperty, getFromStore, setStore, syncStore } from "../storage.js";
import { addFile, getFile } from "../indexedDB.js";
import { fileToBase64, saveFile, updateFileInput } from "../file.js";

const { runtime } = chrome || browser;

const Popup = () => {
  const [inputs, setInputs] = useState([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [file, setFile] = useState(null);
  const [sync, setSync] = useState(false);

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

  const handleFile = async (e) => {
    const {
      target: { files },
    } = e;
    const [file] = files;

    if (file.type !== "application/pdf" || file.size > 1e7) return;
    await addFile(file);
    await setStore(file.name, "file");
    updateFileInput(await fileToBase64(file));
    setFile(file);
  };

  const handleOptionsPage = () => runtime.openOptionsPage();

  useEffect(() => {
    getFromStore(null).then((data) => {
      const { formFiller = [], isEnabled: _isEnabled = true } = data || {};
      setIsEnabled(_isEnabled);
      setInputs(formFiller);
    });
  }, [inputs.length, sync]);

  useEffect(() => {
    getFile().then((_file) => {
      if (!_file) return;
      if (file && file.name === _file.name && file.size === _file.size) return;

      const fileInput = document.getElementById("fileInput");
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(_file);
      fileInput.files = dataTransfer.files;
      setFile(_file);
    });
  }, [sync]);

  useEffect(() => {
    syncStore(() => {
      setSync((prev) => !prev);
    });
  }, []);

  return (
    <div className="py-6 px-5 md:px-10 bg-gray-100 shadow-md text-gray-800 border-gray-400 bg-custom-gradient">
      <div className="flex gap-16 justify-between mb-2">
        <h1 className="text-[32px] font-bold text-gray-700 inline">
          <img className="w-8 h-8 mr-[-6px] inline-block" alt="logo" src={formFiller} />
          orm-Filler
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
      <div className="properties mb-1 py-2 border-b border-[#ead6d6] border-sky-500">
        <h1 className={`text-gray-800 font-bold text-xl  mb-4`}>Properties</h1>
        <ul className="flex flex-col self-center max-h-40 overflow-y-auto">
          {inputs?.map((input, index) => {
            const { name, value } = input;
            return (
              <li key={index} className="flex gap-6 py-2 border-y border-gray-300">
                <div className="text-left basis-20 text-xs leading-6 font-bold min-w-0 overflow-x-hidden">{name}:</div>
                <div className="basis-48 shrink-1 text-xs leading-6 text-left"> {value}</div>
                <div
                  className="w-[18px] shrink-1 text-right grow-0 cursor-pointer text-gray-200 "
                  onClick={() => handleDeleteProperty(index)}
                >
                  <img src={trashSVG} alt="Delete" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="my-4">
        <span className={`text-gray-800  font-bold text-xl mb-4`}>Add a PDF file (CV/Resume) </span>
        <div className="flex gap-3 items-center justify-between">
          <input id="fileInput" type="file" className="hidden" onChange={handleFile} />
          <label
            className="self-start text-center shrink-0 cursor-pointer bg-[#edf2f7] p-2.5 border rounded-md border-[´#cbd5e0] text-sm text-[#4a5568] hover:bg-[#e2e8f0]"
            htmlFor="fileInput"
          >
            {file ? "Change" : "Choose"} file
          </label>
          <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">{file?.name}</div>

          <a id="saveFile" onClick={() => saveFile(file)} href="#">
            <img src={arrowSVG} alt="Save" />
          </a>
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-left mb-2" htmlFor="name">
          <span className="text-gray-800 text-xs font-bold "> Field Name:</span>
          <input
            id="name"
            value={name}
            onChange={handleChange}
            className=" text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full
             h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
            placeholder="(i.e Email, First Name, Last Name)"
          />
        </label>

        <label className="block text-left mb-2" htmlFor="name">
          <span className="text-gray-800 text-xs font-bold leading-tight tracking-normal">Field Value:</span>
          <input
            id="value"
            value={value}
            onChange={handleChange}
            className="text-gray-600 focus:outline-none focus:border focus:border-indigo-700  font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
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
      <a
        className=" hover:bg-indigo-600 hover:text-white text-stone-600 font-bold py-1 px-2 rounded cursor-pointer absolute bottom-0 right-0 mt-2 mr-2"
        onClick={handleOptionsPage}
      >
        Go to Options
      </a>
    </div>
  );
};

export default Popup;
