import React from "react";

import { Button, Container, NavLink } from "reactstrap";

import "./styles/Common.css";
import "./styles/GoDown.css";

import Background from "../assets/bg_lg.jpg";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

const Home = () => {
  var bgStyle = {
    backgroundImage: `url(${Background})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    width: "100vw",
    height: "100vh",
  };

  return (
    <div style={bgStyle}>
      <div id="godown-navbar">
        <div id="godown-100">
          <Container
            style={{
              padding: "40px",
              paddingLeft: "30px",
              backgroundColor: "rgba(34, 37, 41, 0.85)",
              boxShadow: "0px 0px 100px 100px rgba(0, 0, 0, 0.4)",
              borderRadius: "15px",
            }}
          >
            <Container
              style={{
                paddingLeft: "15px",
              }}
            >
              <Logo width={325} />
              <h2 className="text-white">
                Browse unlimited movies, actors, and more.
              </h2>
            </Container>
            <NavLink href="/search">
              <Button color="primary" size="lg" className="mt-3">
                Search
              </Button>
            </NavLink>
          </Container>
        </div>
      </div>
      <Footer dark />
    </div>
  );
};

export default Home;
