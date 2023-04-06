import React, { useEffect, useState } from "react";
import trashSVG from "./assets/trash.svg";
import { addProperty, deleteProperty, getFromStore, setStore } from "../storage.js";
import { data } from "../ContentScript/cacheData.js";
import formFiller from "../Popup/assets/form-filler.png";
import style from "./Options.module.css";

const { checkBulletPoint } = style;

const Options = () => {
  const [inputs, setInputs] = useState([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [alias, setAlias] = useState({});
  const [isEnabled, setIsEnabled] = useState(true);
  const [whiteListItem, setWhiteListItem] = useState("");
  const [whiteList] = useState(data.whiteList);

  const handleChange = async (e) => {
    const setInputValue = {
      toggle: setIsEnabled,
      name: setName,
      value: setValue,
      whiteList: setWhiteListItem,
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

  const handleFile = (e) => {
    const {
      target: { files },
    } = e;
    const [file] = files;

    if (file.type !== "pdf") return false;
  };

  useEffect(() => {
    getFromStore(null).then((data) => {
      const { formFiller = [], isEnabled: _isEnabled = true } = data;

      setIsEnabled(_isEnabled);
      setInputs(formFiller);
    });
  }, [inputs.length]);

  return (
    <div className=" bg-custom-gradient">
      <div className="max-w-[60%] py-6 px-5 md:px-10 shadow-md  text-gray-800 ">
        <div className="flex justify-between mb-4">
          <h1 className="text-[32px] font-bold text-gray-700 inline">
            <img className="w-8 h-8 mr-[-6px] inline-block" alt="logo" src={formFiller} />
            orm-Filler Options
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
        <div className="flex my-4 gap-8">
          <div className="mt-4">
            <h2 className="text-gray-800 text-left font-lg font-bold tracking-normal leading-tight mb-2">Shortcuts</h2>
            <ul className="list-none list-inside space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-gray-600">⌨</span>
                <span> (Ctrl | Cmd ) + Alt + F = Fill forms</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-gray-600">⌨</span>
                <span> (Ctrl | Cmd ) + Alt + A = Add site to white list</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-gray-600">⌨</span>
                <span> (Ctrl | Cmd ) + Alt + R = Remove site from white list</span>
              </li>
            </ul>
          </div>
          <div className="my-4">
            <h2 className="text-gray-800 text-left text-lg font-bold tracking-normal leading-tight mb-2">
              Built-in Configurations
            </h2>
            <ul className="list-none list-inside">
              <li className={checkBulletPoint}>
                Angel List | WellFound (angel.co | wellfound.com) -> Good Fit property name is used to automatic fill
              </li>
              <li className={checkBulletPoint}>
                Y Combinator (workatstartup.com) -> Good Fit property name is used to automatic fill
              </li>
              <li className={checkBulletPoint}>
                Greenhouse ( greenhouse.com) - Select element is transformed differently
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h1 className="text-gray-800 text-left font-lg font-bold tracking-normal leading-tight mb-2">
            White List
            <small className="font-normal"> (sites allowed to execute the extension)</small>
          </h1>

          <ul className="flex mb-2 flex-wrap">
            {Object.keys(whiteList).map((website, index) => {
              return (
                <li className="mx-2 first:mx-0 flex border p-2 mb-2" key={index}>
                  {website}
                  <img
                    className="ml-2 w-[14px] inline-block shrink-1 text-right grow-0 cursor-pointer text-gray-200 hover:scale-105"
                    onClick={() => handleDeleteProperty(index, "whiteList")}
                    src={trashSVG}
                    alt="Delete"
                  />
                </li>
              );
            })}
          </ul>

          <div className="flex gap-3 items-center">
            <label className="block text-left w-full" htmlFor="whiteList">
              <input
                id="whiteList"
                value={whiteListItem}
                onChange={handleChange}
                className="text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal flex items-center pl-3 text-sm border-gray-300 rounded border w-full"
                placeholder="i.e www.google.com, www.hire.io )"
              />
            </label>
            <button
              onClick={handleAddProperty}
              className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 transition duration-150 ease-in-out hover:bg-indigo-600 bg-indigo-700 rounded text-white px-8 text-sm"
            >
              Add
            </button>
          </div>
        </div>
        <div> Automatic Fill </div>

        <div className="properties mb-1 py-3 border-b border-[#ead6d6] border-sky-500">
          <h1 className="text-gray-800 text-left font-lg font-bold tracking-normal leading-tight mb-4">Properties</h1>
          <ul className="flex flex-col self-center h-[38vh] overflow-y-auto">
            {inputs?.map((input, index) => {
              const { name, value, alias } = input;
              return (
                <li key={index} className="flex flex-wrap justify-between py-2 border-y border-gray-300">
                  <div className="mr-2 text-left basis-24 font-bold">{name}:</div>
                  <div className="mr-2 text-left basis-24 font-bold">{alias}:</div>
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
        <div className="mb-2">
          <label htmlFor="file-upload" className="text-gray-800 text-sm font-bold cursor-pointer">
            Add PDF file:
          </label>
          <input id="file-upload" type="file" onChange={handleFile} className="hidden" />
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

          <label className="block text-left" htmlFor="value">
            <span className="text-gray-800 text-sm font-bold leading-tight tracking-normal">Field Value:</span>
            <input
              id="value"
              value={value}
              onChange={handleChange}
              className="mb-5 mt-2 text-gray-600 focus:outline-none focus:border focus:border-indigo-700 font-normal w-full h-10 flex items-center pl-3 text-sm border-gray-300 rounded border"
              placeholder="(i.e Value for the field)"
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
