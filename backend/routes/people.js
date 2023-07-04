var express = require("express");
var router = express.Router();

const getCharacters = require("../utils/getCharacters.js");
const {
  rejectUnauthenticatedWithNoMalformed,
} = require("../middleware/auth.js");

/* GET person details. */
router.get("/:id", rejectUnauthenticatedWithNoMalformed, (req, res, next) => {
  // Return 400 if request contains query parameters
  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({
      error: true,
      message:
        "Invalid query parameters: " +
        Object.keys(req.query).join(", ") +
        ". Query parameters are not permitted.",
    });
  }

  // Construct a response
  return Promise.all([
    req.db.select("*").from("movies.names").where("nconst", req.params.id),
    req.db.select("*").from("movies.principals").where("nconst", req.params.id),
  ])
    .then(([names, principals]) => {
      if (names.length === 0) {
        throw new Error("No record exists of a person with this ID");
      }
      return [names, principals];
    })
    .then(([names, principals]) => {
      req.db
        .select("*")
        .from("movies.basics")
        .whereIn(
          "tconst",
          principals.map((principal) => principal.tconst)
        )
        .then((basics) => {
          return res.json({
            name: names[0].primaryName,
            birthYear: names[0].birthYear,
            deathYear: names[0].deathYear,
            roles: principals.map((principal) => {
              const movie = basics.find(
                (movie) => movie.tconst === principal.tconst
              );
              return {
                movieName: movie.primaryTitle,
                movieId: movie.tconst,
                category: principal.category,
                characters: getCharacters(principal.characters),
                imdbRating: parseFloat(movie.imdbRating) || null,
              };
            }),
          });
        });
    })
    .catch((e) => {
      res.status(404).json({
        error: true,
        message: e.message,
      });
    });
});

module.exports = router;
