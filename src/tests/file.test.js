import { fileToBase64, base64ToBlob, updateFileInput, saveFile } from "../file.js";

describe("fileToBase64", () => {
  test("should convert a File object to a Base64 string", async () => {
    const file = new File(["sample content"], "test.txt", { type: "text/plain" });
    const base64 = await fileToBase64(file);
    expect(base64).toContain("data:text/plain;base64,");
  });

  test("should return null if no file is provided", async () => {
    const base64 = await fileToBase64(null);
    expect(base64).toBeNull();
  });
});

describe("base64ToBlob", () => {
  const fileObject = {
    name: "test.txt",
    contents: "data:text/plain;base64,c2FtcGxlIGNvbnRlbnQ=",
  };

  test("should convert a Base64 string to a Blob object", async () => {
    const blob = await base64ToBlob(fileObject, "text/plain");
    expect(blob).toBeInstanceOf(File);
    expect(blob.name).toEqual(fileObject.name);
    expect(blob.type).toEqual("text/plain");
  });

  test("should return null if no file object is provided", async () => {
    const blob = await base64ToBlob(null);
    expect(blob).toBeNull();
  });
});

describe("updateFileInput", () => {
  beforeEach(() => {
    global.chrome = {
      tabs: {
        query: jest.fn((_, cb) => cb([{ id: 1 }])),
        sendMessage: jest.fn(),
      },
    };
  });

  test("should call chrome.tabs.sendMessage with the correct parameters", () => {
    const file = { name: "test.txt", contents: "data:text/plain;base64,c2FtcGxlIGNvbnRlbnQ=" };
    updateFileInput(file);
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { action: "fill", file });
  });
});

describe("saveFile", () => {
  let link;

  beforeEach(() => {
    link = document.createElement("a");
    link.id = "saveFile";
    document.body.appendChild(link);
    URL.createObjectURL = jest.fn(() => "test-url");
  });

  afterEach(() => {
    document.body.removeChild(link);
  });

  test("should set the download attribute and href for the link element", () => {
    const file = new File(["sample content"], "test.txt", { type: "text/plain" });
    saveFile(file);
    expect(link.download).toEqual("test.txt");
    expect(link.href).toEqual("test-url");
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });
});
