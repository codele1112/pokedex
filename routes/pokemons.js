const fs = require("fs");
var express = require("express");
var router = express.Router();
const { type } = require("os");
var path = require("path");
const { resolve } = require("path");
let rootDir = path.resolve(__dirname);

/* GET all data listing. */
const { pokemons } = require("../pokemon.json");

router.get("/", (req, res, next) => {
  // res.send(pokemons);
  const allowedFilter = ["name", "types", "id", "search"];
  try {
    let { page, limit, ...filterQuery } = req.query;
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
    //Filter data by title
    // console.log("pokemons:", data);
    let result = [];

    if (filterKeys.length) {
      // if (filterQuery.types) {
      //   const searchQuery = filterQuery.types.toLowerCase();
      //   console.log("searchQuery:", searchQuery);

      //   result = data.filter((pokemon) => pokemon.types.includes(searchQuery));
      // }
      if (filterQuery.search) {
        let searchQuery = filterQuery.search.toLowerCase();
        searchQuery = parseInt(searchQuery);
        console.log("searchQueries:", typeof searchQuery);
        result = data.filter((pokemon) => {
          return (
            pokemon.name.includes(searchQuery) ||
            pokemon.id.includes(searchQuery)
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

router.get("/:id", (req, res, next) => {
  try {
    const allowUpdate = ["name", "types"];

    let pokemonId = req?.params?.id;
    pokemonId = parseInt(pokemonId);

    console.log("pokemonId:", typeof pokemonId);
    const updates = req.body;
    const updateKeys = Object.keys(updates);

    //find update request that not allow
    const notAllow = updateKeys.filter((el) => !allowUpdate.includes(el));

    if (notAllow.length) {
      const error = new Error(`Update field not allow`);
      error.statusCode = 400;
      throw error;
    }

    //put processing
    //Read data from db.json then parse to JSobject
    const absolutePath = resolve("./pokemon.json");
    let db = fs.readFileSync(absolutePath, "utf-8");
    db = JSON.parse(db);
    const { data } = db;

    //find pokemon by id
    const targetIndex = data.findIndex((pokemon) => pokemon.id === pokemonId);

    if (targetIndex < 0) {
      const error = new Error(`Pokemon not found`);
      error.statusCode = 404;
      throw error;
    }

    //Update new content to db book JS object
    const updatedPokemon = { ...db.data[targetIndex], ...updates };

    //write and save to db.json
    fs.writeFileSync("data.json", JSON.stringify(db));

    //put send response
    res.status(200).send(updatedPokemon);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const pokemonId = req.params.id;

    let db = fs.readFileSync("data.json", "utf-8");
    db = JSON.parse(db);

    const targetIndex = db.data.findIndex(
      (pokemon) => pokemon.id === pokemonId
    );

    if (targetIndex < 0) {
      const error = new Error("Pokemon not found");
      error.statusCode = 400;
      throw error;
    }
    console.log(pokemonId);
    console.log(targetIndex);

    db.data = db.data.filter((pokemon) => pokemon.id !== pokemonId);

    fs.writeFileSync("data.json", JSON.stringify(db));

    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});
module.exports = router;
