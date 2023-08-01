const fs = require("fs");
var express = require("express");
var router = express.Router();
const { type } = require("os");
var path = require("path");
const { resolve } = require("path");
let rootDir = path.resolve(__dirname);

//Read data from db.json then parse to JSobject
const absolutePath = resolve("./pokemon.json");
let db = fs.readFileSync(absolutePath, "utf-8");
db = JSON.parse(db);
const { data } = db;
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

    let result = [];
    // console.log("filterKeys.length", filterKeys.length);
    if (filterKeys.length) {
      if (filterQuery.types) {
        const searchQuery = filterQuery.types.toLowerCase();
        // console.log("searchQuery:", searchQuery);

        result = data.filter((pokemon) => pokemon.types.includes(searchQuery));
      }
      if (filterQuery.name) {
        let searchQuery = filterQuery.name.toLowerCase();
        // console.log("searchQuery type", typeof searchQuery);
        result = data.filter((pokemon) => {
          return pokemon.name.includes(searchQuery);
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

// [GET] single Pokémon information together with the previous and next pokemon information.
router.get("/:id", (req, res, next) => {
  try {
    const pokemonId = req.params.id;
    // console.log("pokemonId", pokemonId);
    const targetIndex = data.findIndex((pokemon) => {
      pokemonId === pokemon.id;
    });

    console.log("targetId", targetIndex);

    if (targetIndex < 0) {
      const error = new Error("Pokemon not found");
      error.statusCode = 400;
      throw error;
    }

    const lastIndex = data.length - 1;
    let prevIndex = targetIndex - 1;
    let nextIndex = targetIndex + 1;

    if (targetIndex === lastIndex) {
      nextIndex = 0;
    }
    if (targetIndex === 0) {
      prevIndex = lastIndex;
    }

    const pokemon = data[targetIndex];
    const prevPokemon = data[prevIndex];
    const nextPokemon = data[nextIndex];

    let result = {
      pokemon,
      prevPokemon,
      nextPokemon,
    };
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
