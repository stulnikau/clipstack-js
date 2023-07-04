const options = require("./knexfile.js");
const knex = require("knex")(options);
const cors = require("cors");

// Load .env file
require("dotenv").config();

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/openapi.json");

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var moviesRouter = require("./routes/movies.js");
var peopleRouter = require("./routes/people.js");
var userRouter = require("./routes/user.js");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Add response headers to the log
logger.token("res", (req, res) => {
  const headers = {};
  res.getHeaderNames().map((h) => (headers[h] = res.getHeader(h)));
  return JSON.stringify(headers);
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors()); // Enable CORS

// Make the database accessible to the router
app.use((req, res, next) => {
  req.db = knex;
  next();
});

// Routes
app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(swaggerDocument));
app.use("/movies", moviesRouter);
app.use("/people", peopleRouter);
app.use("/user", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
