import React, { useState, useEffect } from "react";
import { data } from "./cacheData.js";

const HotkeyCommands = () => {
  const [visible, setVisible] = useState(false);
  const [phrase, setPhrase] = useState("");

  const toggleOverlay = (event) => {
    if (!data.isEnabled) return;

    clearTimeout(data.timeoutToggle);

    if (event.ctrlKey && event.altKey && event.key === "f") {
      setVisible(true);
      setPhrase("Ctrl + Alt + F  ( Fill )");
    }
    if (event.ctrlKey && event.altKey && event.key === "a") {
      setVisible(true);
      setPhrase("Ctrl + Alt + A  ( Add to whitelist )");
    }
    if (event.ctrlKey && event.altKey && event.key === "r") {
      setVisible(true);
      setPhrase("Ctrl + Alt + R  ( Remove from whitelist )");
    }

    data.timeoutToggle = setTimeout(() => {
      setVisible(false);
    }, 1500);
  };

  useEffect(() => {
    window.addEventListener("keydown", toggleOverlay);
    return () => {
      window.removeEventListener("keydown", toggleOverlay);
    };
  }, []);

  return visible ? (
    <div className="fixed bottom-0 left-0 w-full z-50">
      <div className="flex justify-center items-center  bg-black bg-opacity-30">
        <span className="text-white text-2xl py-2 m-0 p-0 uppercase">
          {phrase}
        </span>
      </div>
    </div>
  ) : null;
};

export default HotkeyCommands;
