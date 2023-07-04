import React from "react";

const Footer = ({ dark }) => {
  let id = "";
  let className = "text-center";
  let style = {};

  if (dark) {
    id = "footer";
    style = {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      boxShadow: "0px 0px 100px 100px rgba(0, 0, 0, 0.5)",
    };
    className = "text-center text-white";
  }

  return (
    <div id={id} style={style}>
      <p className={className}>
        All data is from IMDB, Metacritic and RottenTomatoes.
      </p>
      <p className={className}>© 2023 Pavel Stulnikov</p>
    </div>
  );
};

export default Footer;
