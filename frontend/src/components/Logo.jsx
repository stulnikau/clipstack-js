import logo from "../assets/logo.png";

import React from "react";

const Logo = ({ width }) => {
  return (
    <div className="logo">
      <img src={logo} alt="logo" width={width} />
    </div>
  );
};

export default Logo;
