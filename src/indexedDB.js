const indexedDb = {
  request: null,
  database: null,
  objectStore: null,
};

indexedDb.request = indexedDB.open("pdfDatabase", 1);

indexedDb.request.addEventListener("success", (event) => {
  console.log("Success creating/accessing IndexedDB database");
  const { result } = event.target;
  indexedDb.database = result;
  indexedDb.database.onversionchange = () => {
    indexedDb.database?.close();
  };

  indexedDb.database.onerror = (event) => {
    console.log("Database error", event.target.errorCode);
  };
});

indexedDb.request.onerror = (event) => {
  console.error("Some error occurred:", event);
};

indexedDb.request.onupgradeneeded = (event) => {
  indexedDb.database = event.target.result;
  indexedDb.objectStore = indexedDb.database.createObjectStore("pdfFiles", {
    autoIncrement: true,
  });
};

const getDatabase = () => {
  return new Promise((res) => {
    if (indexedDb.database) return res(indexedDb.database);

    indexedDb.request.addEventListener("success", (event) => {
      console.log("getting database successful");
      const { result } = event.target;
      return res(result);
    });
  });
};

const addFile = async (fileBlob) => {
  const database = indexedDb.database || (await getDatabase());
  const transaction = database.transaction("pdfFiles", "readwrite");

  console.log(fileBlob);

  const query = transaction.objectStore("pdfFiles").put(fileBlob, 0);

  return new Promise((res, rej) => {
    query.onerror = (event) => {
      console.log(event.target.errorCode);
      return rej(event);
    };

    query.onsuccess = (event) => {
      console.log(event);
      return res(event);
    };
  });
};

const removeFile = async () => {
  const database = indexedDb.database || (await getDatabase());
  const transaction = database.transaction("pdfFiles", "readwrite");
  const query = transaction.objectStore("pdfFiles").delete(1);

  query.onerror = (event) => {
    console.log(event.target.errorCode);
  };

  query.onsuccess = (event) => {
    console.log(event);
  };
};

const getFile = async () => {
  const database = await getDatabase();
  const transaction = database.transaction("pdfFiles", "readwrite");
  const query = transaction.objectStore("pdfFiles").get(0);

  return new Promise((res, rej) => {
    query.onerror = (event) => {
      console.log(event.target.errorCode);
      return rej(event);
    };

    query.onsuccess = (event) => {
      console.log(event);
      console.log("Result", query.result);
      return res(query.result);
    };
  });
};

export { addFile, removeFile, getFile };
