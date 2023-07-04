import React from "react";

import "./Poster";
import Poster from "./Poster";

import "./styles/MovieHero.css";

import { Badge } from "reactstrap";

const minToHM = (min) => {
  let hours = Math.floor(min / 60);
  let minutes = min % 60;
  return hours + "h " + minutes + "m";
};

const styliseDollars = (dollars) => {
  return "$" + dollars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const MovieHero = ({ movieData }) => {
  return (
    <div className="movie-hero">
      <Poster link={movieData.poster} />
      <div className="movie-detail-wrapper">
        <h1>{movieData.title}</h1>
        <h6>
          {movieData.year} • {minToHM(movieData.runtime)}
        </h6>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            paddingBottom: "15px",
          }}
        >
          {movieData.genres.map((genre) => {
            return (
              <Badge className="genre-badge" pill>
                {genre}
              </Badge>
            );
          })}
        </div>
        <h6>
          Box Office:{" "}
          {movieData.boxoffice ? styliseDollars(movieData.boxoffice) : "N/A"}
        </h6>
        <h6>Country: {movieData.country}</h6>
        <p>{movieData.plot}</p>
        {movieData.ratings.map((rating) => {
          return (
            <h6>
              {rating.source}: {rating.value ? rating.value : "N/A"}
            </h6>
          );
        })}
      </div>
    </div>
  );
};

export default MovieHero;
