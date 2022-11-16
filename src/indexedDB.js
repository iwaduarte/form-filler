const {
  msIDBTransaction,
  OIDBTransaction,
  webkitIDBTransaction,
  indexedDB: indexedDB1,
  msIndexedDB,
  OIndexedDB,
  mozIndexedDB,
  webkitIndexedDB,
} = window;
window.indexedDB =
  indexedDB1 || webkitIndexedDB || mozIndexedDB || OIndexedDB || msIndexedDB;
window.IDBTransaction =
  window.IDBTransaction ||
  webkitIDBTransaction ||
  OIDBTransaction ||
  msIDBTransaction;
window.dbVersion = 1;

/*
    Note: The recommended way to do this is assigning it to window.indexedDB,
    to avoid potential issues in the global scope when web browsers start
    removing prefixes in their implementations.
    You can assign it to a variable, like var indexedDB… but then you have
    to make sure that the code is contained within a function.
*/

// Create/open database
const request = indexedDB.open("pdfFiles", dbVersion);

request.onsuccess = (event) => {
  console.log("Success creating/accessing IndexedDB database");
  database = event.target.result;

  database.onerror = (event) => {
    console.log(
      "Error creating/accessing IndexedDB database",
      event.target.errorCode
    );
  };

  // Interim solution for Google Chrome to create an objectStore. Will be deprecated
  if (database.setVersion) {
    if (database.version !== dbVersion) {
      const setVersion = database.setVersion(dbVersion);
      setVersion.onsuccess = function () {
        createObjectStore(database);
        getImageFile();
      };
    } else {
      getImageFile();
    }
  } else {
    getImageFile();
  }
};

database.onupgradeneeded = (event) => {
  const database = event.target.result;
  const objectStore = database.createObjectStore("name", { keyPath });
};
