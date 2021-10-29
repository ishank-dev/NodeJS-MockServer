// Imports
const express = require("express");
const router = express.Router();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// store is the runtime db
let store = {};

/**
 * Function to initialize the store object from the store.json file at the beginning
 */
function readStoreJSON() {
  fs.readFile("./db/store.json", "utf8", function callback(err, data) {
    if (err) {
      console.log("DB not read");
    } else {
      store = JSON.parse(data);
    }
  });
}
readStoreJSON();

// write into json
function writeStoreJson(store) {
  fs.writeFile(
    "./db/store.json",
    JSON.stringify(store, null, 4),
    "utf8",
    function cb(err) {
      if (err) {
      }
    }
  );
}
// Helper functions

/**
 * Function to find all the items present under one entity, supplements the function filterEntityById
 * @param {*} jsonArray
 * @param {*} key
 * @param {*} value
 */
function findFirst(jsonArray, key, value) {
  return jsonArray.filter(function (obj) {
    return obj[key] == value;
  })[0];
}

/**
 * Function to filter entities by entityType
 * @param {*} store
 * @param {*} entityType
 * @param {*} id
 */
function filterEntityById(store, entityType, id) {
  if (entityType in store) {
    return findFirst(store[entityType], "id", id);
  }
}
/**
 * Function to delete an entity by id
 * @param {*} store
 * @param {*} entityType
 * @param {*} id
 */
function removeEntityById(store, entityType, id) {
  const indexToDelete = store[entityType].findIndex((obj) => obj["id"] == id);
  if (indexToDelete > -1) {
    store[entityType].splice(indexToDelete, 1);
    return 1;
  } else return -1;
}
/**
 * Function to merge two JSON objects, used in put request to merge the new JSON with the db
 * @param {*} obj1
 * @param {*} obj2
 */
function mergeEntities(obj1, obj2) {
  for (var key in obj2) {
    obj1[key] = obj2[key];
  }
  return obj1;
}
/**
 * Function to apply filters by value eg. ?name=,?category= etc.
 * @param {*} dataArray
 * @param {*} filters
 */
function applyFilters(dataArray, filters) {
  if (!filters) return dataArray;
  var filterKeys = Object.keys(filters);
  return dataArray.filter(function (eachObj) {
    return filterKeys.every(function (eachKey) {
      if (!filters[eachKey].length) {
        return true;
      }
      return filters[eachKey].includes(eachObj[eachKey]);
    });
  });
}
/**
 * function to implement search query eg. ?_q=
 * @param {*} dataArray
 * @param {*} searchTerms
 */
function applySearch(dataArray, searchTerms) {
  if (!searchTerms) {
    return dataArray;
  }
  let results = [];
  for (i in dataArray) {
    for (j in dataArray[i]) {
      let matched = false;
      for (k in searchTerms) {
        if (
          String(dataArray[i][j])
            .toLowerCase()
            .includes(searchTerms[k].toLowerCase())
        ) {
          results.push(dataArray[i]);
          matched = true;
          break;
        }
      }
      if (matched) {
        break;
      }
    }
  }
  return results;
}
/**
 * function to sort the data, results are ascending by default
 * @param {*} dataArray
 * @param {*} sortKey
 * @param {*} sortOrder
 */
function sortData(dataArray, sortKey, sortOrder) {
  if (!dataArray) return dataArray;
  sortKey = sortKey.toLowerCase();
  dataArray = dataArray.sort(function (a, b) {
    if (a[sortKey] < b[sortKey]) {
      return -1;
    }
    if (a[sortKey] > b[sortKey]) {
      return 1;
    }
  });
  if (sortOrder == "desc") {
    dataArray.reverse();
  }
  return dataArray;
}
/**
 * Function to handle all the filters, filtering happens in three phases, filtering at entity level, searching at entity level and finally sorting at entity level
 * @param {*} dataArray
 * @param {*} filters
 * @param {*} searchTerms
 * @param {*} sortKey
 * @param {*} sortOrder
 */
function filterSearchSort(dataArray, filters, searchTerms, sortKey, sortOrder) {
  if (!dataArray) return dataArray;
  dataArray = applyFilters(dataArray, filters);
  dataArray = applySearch(dataArray, searchTerms);
  dataArray = sortData(dataArray, sortKey, sortOrder);
  return dataArray;
}

/*
Below is the list of API Endpoints used to dynamically generate entities and store them in store.json file
*/

// GET request to get a list of entities present in the file
router.get("/", (req, res) => {
  res.send(Object.keys(store));
});

function respondWith404(res) {
  res.status("404").send("Not Found");
}

// GET request to get a single entity by type
router.get("/:entityType", (req, res) => {
  let entityType = req.params.entityType;

  if (!(entityType in store)) {
    respondWith404(res);
  }
  let searchTerms = [].concat(req.query["_q"] || "");
  let sortOrder = req.query["_order"] || "asc";
  let sortKey = req.query["_sort"] || "id";
  let filters = req.query;
  delete filters["_q"];
  delete filters["_order"];
  delete filters["_sort"];
  res.send(
    filterSearchSort(
      store[req.params.entityType],
      filters,
      searchTerms,
      sortKey,
      sortOrder
    )
  );
});

// GET list of the a single entity by id
router.get("/:entityType/:id", (req, res) => {
  let entity = filterEntityById(store, req.params.entityType, req.params.id);
  if (entity) {
    res.send(entity);
  } else {
    return respondWith404(res);
  }
});

// Add a new entity to the store.json file
router.post("/:entityType", (req, res) => {
  let entities = store[req.params.entityType];
  if (!entities) {
    entities = [];
    store[req.params.entityType] = entities;
  }
  let id = uuidv4();
  let newEntity = req.body;
  newEntity["id"] = id;
  entities.push(newEntity);
  res.send(newEntity);
  writeFileJson(store);
});
// Update an existing entity rowby id
router.put("/:entityType/:id", (req, res) => {
  let storedEntity = filterEntityById(
    store,
    req.params.entityType,
    req.params.id
  );
  if (!storedEntity) {
    respondWith404(res);
  }

  let updateObject = req.body;

  if (req.body.id && req.body.id != storedEntity.id) {
    res.status(400).send("id can't be mutated");
  }

  mergedEntity = mergeEntities(storedEntity, updateObject);
  store[req.params.entityType].map((obj) =>
    obj.id === mergedEntity.id ? mergedEntity : obj
  );

writeFileJson(store);
  res.send(mergedEntity);
});

// Delete a existing entity row by id
router.delete("/:entityType/:id", (req, res) => {
  let entityType = req.params.entityType;
  let id = req.params.id;
  if (removeEntityById(store, entityType, id) != -1) {
    res.send("Deleted Successfully");
    writeStoreJson(store);
  } else {
    respondWith404(res);
  }
});

module.exports = router;
