var express = require("express");
var router = express.Router();
/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to CoderSchool!");
});
/* GET pokemons. */

const pokemonsRouter = require("./pokemons.js");
router.use("/pokemons", pokemonsRouter);
module.exports = router;
