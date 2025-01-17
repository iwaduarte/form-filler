import React, { useEffect, useState } from "react";
import trashSVG from "./assets/trash.svg";
import importIcon from "./assets/import.svg";
import exportIcon from "./assets/export.svg";
import {
  addProperty,
  addWhiteList,
  deleteProperty,
  deleteWhiteList,
  getFromStore,
  setStore,
  syncStore,
  updateProperty,
} from "../storage.js";
import { data as cache } from "../ContentScript/cacheData.js";
import formFiller from "../Popup/assets/form-filler.png";
import style from "./Options.module.css";
import { addFile, getFile } from "../indexedDB.js";
import arrowSVG from "../Popup/assets/arrow.svg";
import { fileToBase64, saveFile, updateFileInput } from "../file.js";

const { checkBulletPoint } = style;

const Options = () => {
  const [inputs, setInputs] = useState([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [aliasValues, setAliasValues] = useState({});
  const [aliases, setAliases] = useState({});
  const [isEnabled, setIsEnabled] = useState(true);
  const [whiteListItem, setWhiteListItem] = useState("");
  const [whiteList, setWhiteList] = useState(cache.whiteList);
  const [sync, setSync] = useState(false);
  const [file, setFile] = useState(null);

  const handleChange = async (e) => {
    const setInputValue = {
      toggle: setIsEnabled,
      name: setName,
      value: setValue,
      whiteList: setWhiteListItem,
      alias: (value, name) => {
        setAliasValues({
          ...aliasValues,
          [name]: value,
        });
      },
    };
    const { id, value, type, checked, name } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (type === "checkbox") await setStore(checked, "isEnabled");
    setInputValue[id](newValue, name);
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

  const handleAddAlias = async (propertyName, newAlias) => {
    if (!newAlias) return;
    const newPropertyAliases = {
      aliases: [...(aliases[propertyName] || []), newAlias],
    };
    setAliases((prevAliases) => ({
      ...prevAliases,
      [propertyName]: [...(prevAliases[propertyName] || []), newAlias],
    }));
    await updateProperty(propertyName, newPropertyAliases);
  };

  const handleRemoveAlias = async (propertyName, aliasIndex) => {
    const newPropertyAliases = {
      aliases: aliases[propertyName].filter((_, index) => index !== aliasIndex),
    };
    setAliases((prevAliases) => ({
      ...prevAliases,
      [propertyName]: prevAliases[propertyName].filter((_, index) => index !== aliasIndex),
    }));
    await updateProperty(propertyName, newPropertyAliases);
  };

  const handleFile = async (e) => {
    const {
      target: { files },
    } = e;
    const [file] = files;

    if (file.type !== "application/pdf" || file.size > 1e7) return;
    await addFile(file);
    updateFileInput(await fileToBase64(file));
    await setStore(file.name, "file");
    setFile(file);
  };

  const handleImportConfig = async (event) => {
    const file = event.target.files[0];

    if (!file) return;
    if (file.type !== "application/json") {
      console.log("Please upload a valid JSON file.");
      return;
    }
    const fileContent = await file.text();
    const importedData = JSON.parse(fileContent);
    await Promise.all(Object.keys(importedData).map(async (key) => setStore(importedData[key], key)));
    setSync((prev) => !prev);
    console.log("Imported Data successfully:", importedData);
  };
  const handleDownloadConfig = async () => {
    const storeData = await getFromStore(null);
    delete storeData.isEnabled;
    delete storeData.file;

    const jsonBlob = new Blob([JSON.stringify(storeData, null, 2)], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = "store-data.json"; // Filename for the JSON
    jsonLink.click();
    URL.revokeObjectURL(jsonUrl);
  };

  useEffect(() => {
    getFromStore(null).then((data) => {
      const { formFiller = [], isEnabled: _isEnabled = true, whiteList } = data || {};
      setIsEnabled(_isEnabled);
      setInputs(formFiller);
      setAliases(formFiller.reduce((acc, { name, aliases }) => ({ ...acc, [name]: aliases }), {}));
      setWhiteList({ ...cache.whiteList, ...whiteList });
    });
  }, [inputs.length, sync]);

  useEffect(() => {
    getFile().then((_file) => {
      const fileInput = document.getElementById("file-upload");
      if (!_file || !fileInput) return;
      if (file && file.name === _file.name && file.size === _file.size) return;

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
    <div className=" bg-custom-gradient">
      <div className="max-w-[80%] py-6 px-5 md:px-10 shadow-md  text-gray-800 ">
        <div className="flex justify-between mb-4">
          <h1 className="text-[32px] font-bold text-gray-700 inline">
            <img className="w-8 h-8 mr-[-6px] inline-block" alt="logo" src={formFiller} />
            orm-Filler Options
          </h1>

          <div className="flex gap-4 items-center">
            <div className="flex items-center ">
              <label
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out hover:bg-gray-300 bg-gray-100 text-gray-600 rounded-full p-2 text-sm"
                title="Import Config"
              >
                <input onChange={handleImportConfig} id="json-upload" type="file" className="hidden" />
                <img src={importIcon} alt="Import Config" className="w-4 h-4" />
              </label>

              <button
                onClick={handleDownloadConfig}
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out hover:bg-gray-300 bg-gray-100 text-gray-600 rounded-full p-2 text-sm"
                title="Export Config"
              >
                <img src={exportIcon} alt="Clear Config" className="w-4 h-4" />
              </button>
            </div>
            <div>
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
        </div>
        <div className="flex my-4 gap-8">
          <div className="mt-4">
            <h2 className="text-gray-800 text-left text-lg font-bold tracking-normal leading-tight mb-2">Shortcuts</h2>
            <ul className="list-none list-inside space-y-2">
              <li className="flex items-center  text-xs space-x-2">
                <span className="text-gray-600">⌨</span>
                <span> (Ctrl | Cmd ) + Alt + F = Fill forms</span>
              </li>
              <li className="flex items-center text-xs space-x-2">
                <span className="text-gray-600">⌨</span>
                <span> (Ctrl | Cmd ) + Alt + A = Add site to white list</span>
              </li>
              <li className="flex items-center text-xs space-x-2">
                <span className="text-gray-600">⌨</span>
                <span> (Ctrl | Cmd ) + Alt + R = Remove site from white list</span>
              </li>
            </ul>
          </div>
          <div className="my-4">
            <h2 className="text-gray-800 text-left text-lg font-bold tracking-normal leading-tight mb-2">
              Built-in Configurations
            </h2>
            <ul className="list-none list-inside text-xs space-y-2">
              <li className={`${checkBulletPoint}`}>
                Angel List | WellFound (angel.co | wellfound.com) -&gt; Good Fit property name is used to automatic fill
              </li>
              <li className={checkBulletPoint}>
                Y Combinator (workatstartup.com) -&gt; Good Fit property name is used to automatic fill
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h1 className="text-gray-800 text-left text-lg font-bold tracking-normal leading-tight mb-2">
            White List
            <small className="font-normal"> - sites allowed to execute the extension automatically </small>
          </h1>

          <ul className="flex flex-wrap">
            {Object.entries(whiteList).map(([website, value], index) => {
              if (!value) return null;
              return (
                <li className="flex border p-2 mb-2" key={index}>
                  {website}
                  <img
                    className="ml-2 w-[14px] inline-block shrink-1 text-right grow-0 cursor-pointer text-gray-200 hover:scale-105"
                    onClick={() => {
                      deleteWhiteList(website).then();
                      setWhiteList((prevWhiteList) => ({
                        ...prevWhiteList,
                        [website]: false,
                      }));
                    }}
                    src={trashSVG}
                    alt="Delete"
                  />
                </li>
              );
            })}
          </ul>

          <div className="flex gap-3 items-center mb-4">
            <label className="text-left" htmlFor="whiteList">
              <input
                id="whiteList"
                value={whiteListItem}
                onChange={handleChange}
                className="text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
                placeholder="i.e www.google.com"
              />
            </label>
            <button
              onClick={() => {
                addWhiteList(whiteListItem.replace(/^(www\.)/, "")).then();
                setWhiteListItem("");
              }}
              className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 bg-indigo-700 rounded text-white px-8 py-2 text-sm"
            >
              Add
            </button>
          </div>
        </div>
        <div className="text-gray-800 text-left text-lg font-bold tracking-normal leading-tight mb-2">
          Automatic Fill:
        </div>
        <div className="properties max-w-[1000px] mb-4 py-3 border-b border-[#ead6d6] border-sky-500 ">
          <h1 className="text-gray-800 text-left text-sm font-bold tracking-normal leading-tight mb-4">Properties</h1>
          <ul className="flex flex-col max-h-[30vh] overflow-y-auto">
            {inputs?.map((input, index) => {
              const { name, value } = input;
              const propertyAliases = aliases[name] || [];

              return (
                <li key={index} className="flex gap-4 items-baseline py-2 border-y border-gray-300">
                  <div className="text-left w-24 break-words font-bold ">{name}:</div>
                  <div className="w-32 break-words whitespace-normal text-left"> {value}</div>
                  <ul className="basis-24 grow-0 shrink-0 flex flex-col min-w-0 flex-wrap items-start">
                    <span className="text-gray-600 text-left font-bold">Aliases:</span>
                    {propertyAliases.map((alias, aliasIndex) => (
                      <li
                        key={aliasIndex}
                        className=" cursor-pointer inline-flex items-center px-2 py-1 m-1 rounded text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <span>{alias}</span>
                        <button
                          className="ml-2 text-gray-400 hover:text-red-500"
                          onClick={() => handleRemoveAlias(name, aliasIndex)}
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="">
                    <input
                      id="alias"
                      type="text"
                      name={name}
                      value={aliasValues[name] || ""}
                      onChange={handleChange}
                      className="border rounded pl-3"
                      placeholder="Add alias"
                    />
                    <button
                      onClick={() => {
                        handleAddAlias(name, aliasValues[name]).then();
                        setAliasValues({
                          ...aliasValues,
                          [name]: "",
                        });
                      }}
                      className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 bg-indigo-700 rounded text-white p-1 text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <img
                    className="w-[18px] text-right cursor-pointer text-gray-200 hover:scale-105"
                    onClick={() => handleDeleteProperty(index)}
                    src={trashSVG}
                    alt="Delete Property"
                    title="Delete Property"
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <div className="my-6">
          <span className="text-gray-800  font-bold text-xl mb-4 block">Add a PDF file (CV/Resume) </span>
          <div className="flex items-center gap-8">
            <label
              className="  self-start text-center shrink-0 cursor-pointer bg-[#edf2f7] p-2.5 border rounded-md border-[´#cbd5e0] text-sm text-[#4a5568] hover:bg-[#e2e8f0]"
              htmlFor="file-upload"
            >
              {file ? "Change" : "Choose"} file
            </label>

            <div className=" overflow-hidden whitespace-nowrap overflow-ellipsis">{file?.name}</div>
            <input id="file-upload" type="file" onChange={handleFile} className="hidden" />
            <a id="saveFile" onClick={() => saveFile(file)} href="#">
              <img src={arrowSVG} alt="Save" />
            </a>
          </div>
        </div>
        <div className="flex gap-8">
          <label className=" text-left" htmlFor="name">
            <span className="text-gray-800 text-sm font-bold "> Field Name:</span>
            <input
              id="name"
              value={name}
              onChange={handleChange}
              className="mb-5 mt-2 text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
              placeholder="i.e Email, First Name"
            />
          </label>

          <label className=" text-left" htmlFor="value">
            <span className="text-gray-800 text-sm font-bold leading-tight tracking-normal">Field Value:</span>
            <input
              id="value"
              value={value}
              onChange={handleChange}
              className="mb-5 mt-2 text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
              placeholder="i.e Value for the field"
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
    </div>
  );
};

export default Options;
