const fs = require("fs");
var express = require("express");
var router = express.Router();
const { type } = require("os");
var path = require("path");
const { resolve } = require("path");
let rootDir = path.resolve(__dirname);

/* GET all data, filter by name, types */

router.get("/", (req, res, next) => {
  // res.send(pokemons);
  const { body, params, url, query } = req;
  console.log({ body, params, url, query });

  const allowedFilter = ["name", "types", "id", "search"];
  try {
    let { page, limit, ...filterQuery } = req.query;
    console.log("filterQuery:", filterQuery);

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 50;
    //allow name,limit and page query string only
    const filterKeys = Object.keys(filterQuery);
    console.log("filterKeys:", filterKeys);

    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    // //processing logic

    //Number of items skip for selection
    let offset = limit * (page - 1);

    //Read data from db.json then parse to JSobject
    const absolutePath = resolve("./pokemon.json");
    let db = fs.readFileSync(absolutePath, "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    let result = [];
    console.log("filterKeys.length", filterKeys.length);
    if (filterKeys.length) {
      if (filterQuery.types) {
        const searchQuery = filterQuery.types.toLowerCase();
        console.log("searchQuery:", searchQuery);

        result = data.filter((pokemon) => pokemon.types.includes(searchQuery));
      }
      if (filterQuery.search) {
        let searchQuery = filterQuery.search.toLowerCase();
        console.log("searchQuery type", typeof searchQuery);
        result = data.filter((pokemon) => {
          return (
            pokemon.id.includes(searchQuery) ||
            pokemon.name.includes(searchQuery)
          );
        });
      }
    } else {
      result = data;
    }

    // then select number of result by offset
    result = result.slice(offset, offset + limit);
    //send response
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
