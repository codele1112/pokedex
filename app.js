var express = require("express");
var dotenv = require("dotenv");
dotenv.config();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
// var pokemonRouter = require("./routes/pokemons");

require("dotenv").config();
const cors = require("cors");
var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.statusCode = 404;
  res.status(err.statusCode).send(err.message);
});

module.exports = app;
