const fileToBase64 = (file) => {
  if (!file) return null;
  const reader = new FileReader();

  return new Promise((res) => {
    reader.onload = (event) => {
      const contents = event.target.result;
      const pdfFile = {
        name: file.name,
        contents: contents,
      };
      return res(JSON.stringify(pdfFile));
    };
    reader.readAsDataURL(file);
  });
};

const base64ToBlob = async (fileObject, mime) => {
  if (!fileObject) return null;
  const { contents, name } = fileObject;
  const blob = await fetch(contents).then((file) => file.blob());
  return new File([blob], name, {
    type: mime,
  });
};

export { fileToBase64, base64ToBlob };
