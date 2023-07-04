import React from "react";

import "./styles/Poster.css";

const Poster = ({ link }) => {
  return (
    <div>
      <img
        className="poster"
        src={link}
        alt="movie poster"
        style={{
          height: "325px",
          width: "auto",
          boxShadow: "0px 0px 42px 1px rgba(0, 0, 0, 0.25)",
        }}
      />
    </div>
  );
};

export default Poster;
