import { useState, Fragment } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import Popup from "./pages/Popup.jsx";
import Content from "./pages/Content.jsx";

const App = () => {
  // return
  return (
    <>
      <Content />
      <Popup />
    </>
  );
};

export default App;
