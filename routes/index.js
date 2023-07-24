var express = require("express");
var router = express.Router();

/* GET home page. */

const pokemonsRouter = require("./pokemons.js");
router.use("/pokemons", pokemonsRouter);
module.exports = router;
