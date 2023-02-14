const indexedDb = {
  request: null,
  database: null,
  objectStore: null,
};

let i = 0;

indexedDb.request = indexedDB.open("pdfDatabase", 1);

indexedDb.request.addEventListener("success", (event) => {
  console.log("Success creating/accessing IndexedDB database");
  const { result } = event.target;
  indexedDb.database = result;

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

const addFile = (fileBlob) => {
  const transaction = indexedDb.database.transaction("pdfFiles", "readwrite");
  const query = transaction.objectStore("pdfFiles").put(fileBlob);

  return new Promise((res, rej) => {
    query.onerror = (event) => {
      console.log(event.target.errorCode);
      return rej(event);
    };

    query.onsuccess = (event) => {
      console.log(event);
      return res(event);
    };

    transaction.oncomplete = () => {
      console.log("closing database");
      indexedDb.database.close();
    };
  });
};

const removeFile = () => {
  const transaction = indexedDb.database.transaction("pdfFiles", "readwrite");
  const query = transaction.objectStore("pdfFiles").delete(1);

  query.onerror = (event) => {
    console.log(event.target.errorCode);
  };

  query.onsuccess = (event) => {
    console.log(event);
  };

  transaction.oncomplete = () => {
    indexedDb.database.close();
  };
};

const getFile = async () => {
  const database = await getDatabase();
  const transaction = database.transaction("pdfFiles", "readwrite");
  const query = transaction.objectStore("pdfFiles").get(1);

  return new Promise((res, rej) => {
    query.onerror = (event) => {
      console.log(event.target.errorCode);
      return rej(event);
    };

    query.onsuccess = (event) => {
      console.log(event);
      return res(query.result);
    };

    transaction.oncomplete = () => {
      console.log("closing database");
      database.close();
    };
  });
};

export { addFile, removeFile, getFile };
