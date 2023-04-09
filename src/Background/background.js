import { getFile } from "../indexedDB.js";
import { fileToBase64 } from "../file.js";

const { tabs } = chrome || browser;

const executeContentScript = async () => {
  const file = await getFile().then((file) => fileToBase64(file));

  const stringCode = "var pdfFile = " + file;
  console.log(stringCode.substring(0, 150));

  tabs.executeScript(
    {
      code: stringCode,
      allFrames: true,
    },
    function () {
      tabs.executeScript({
        allFrames: true,
        file: "src/ContentScript/main.js",
      });
    }
  );
};

tabs.onUpdated.addListener(executeContentScript);
