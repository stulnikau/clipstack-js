var express = require("express");
var router = express.Router();

const getCharacters = require("../utils/getCharacters.js");
const { parse } = require("dotenv");

const PER_PAGE = 100;

// Build the filter for the search query
const buildSearchFilter = (qb, filter) => {
  if (filter.title) {
    qb.where("primaryTitle", "like", `%${filter.title}%`);
  }
  if (filter.year) {
    qb.where("year", filter.year);
  }
};

// Build the ratings array in movie details
const getRatings = (movieData) => {
  var ratings = [];
  if (movieData.imdbRating) {
    ratings.push({
      source: "Internet Movie Database",
      value: parseFloat(movieData.imdbRating) || null,
    });
  }
  if (movieData.rottentomatoesRating) {
    ratings.push({
      source: "Rotten Tomatoes",
      value: parseFloat(movieData.rottentomatoesRating) || null,
    });
  }
  if (movieData.metacriticRating) {
    ratings.push({
      source: "Metacritic",
      value: parseFloat(movieData.metacriticRating) || null,
    });
  }
  return ratings;
};

/* GET movies search results. */
router.get("/search", (req, res, next) => {
  // Check if year is a valid 4-digit number
  if (req.query.year && !/^\d{4}$/.test(req.query.year)) {
    return res.status(400).json({
      error: true,
      message: "Invalid year format. Format must be yyyy.",
    });
  }

  // Check if page is a valid number
  if (req.query.page && !/^\d+$/.test(req.query.page)) {
    return res.status(400).json({
      error: true,
      message: "Invalid page format. page must be a number.",
    });
  }

  var page = parseInt(req.query.page) || 1;
  if (page < 1) page = 1;

  var offset = (page - 1) * PER_PAGE;
  return Promise.all([
    req.db
      .count("id as count")
      .from("movies.basics")
      .where((qb) => buildSearchFilter(qb, req.query)),
    req.db
      .select("*")
      .from("movies.basics")
      .where((qb) => buildSearchFilter(qb, req.query))
      .limit(PER_PAGE)
      .offset(offset),
  ])
    .then(([total, rows]) => {
      res.json({
        data: rows.map((row) => {
          return {
            title: row.primaryTitle,
            year: row.year,
            imdbID: row.tconst,
            imdbRating: parseFloat(row.imdbRating) || null,
            rottenTomatoesRating: parseFloat(row.rottentomatoesRating) || null,
            metacriticRating: parseFloat(row.metacriticRating) || null,
            classification: row.rated,
          };
        }),
        pagination: {
          total: total[0].count,
          lastPage: Math.ceil(total[0].count / PER_PAGE),
          prevPage: page > 1 ? page - 1 : null,
          nextPage:
            page < Math.ceil(total[0].count / PER_PAGE) ? page + 1 : null,
          perPage: PER_PAGE,
          currentPage: page,
          from: offset,
          to: offset + rows.length,
        },
      });
    })
    .catch((_) => {
      res.status(500).json({
        error: true,
        message: "An error occurred while retrieving movies",
      });
    });
});

/* GET movie details. */
router.get("/data/:imdbID", (req, res, next) => {
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

  return Promise.all([
    req.db.select("*").from("movies.basics").where("tconst", req.params.imdbID),
    req.db
      .select("*")
      .from("movies.principals")
      .where("tconst", req.params.imdbID),
  ])
    .then(([basics, principals]) => {
      if (basics.length === 0) {
        return res.status(404).json({
          error: true,
          message: "No record exists of a movie with this ID",
        });
      }
      return res.json({
        title: basics[0].primaryTitle,
        year: basics[0].year,
        runtime: basics[0].runtimeMinutes,
        genres: basics[0].genres.split(","),
        country: basics[0].country,
        principals: principals.map((principal) => {
          return {
            id: principal.nconst,
            category: principal.category,
            name: principal.name,
            characters: getCharacters(principal.characters),
          };
        }),
        ratings: getRatings(basics[0]),
        boxoffice: basics[0].boxoffice,
        poster: basics[0].poster,
        plot: basics[0].plot,
      });
    })
    .catch((_) => {
      res.status(500).json({
        error: true,
        message: "An error occurred while retrieving movie details",
      });
    });
});

module.exports = router;
