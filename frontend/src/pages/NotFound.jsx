import React from "react";
import { Link } from "react-router-dom";

import "./styles/GoDown.css";

import { Container, Alert } from "reactstrap";
import Footer from "../components/Footer";

const NotFound = () => {
  return (
    <div
      id="godown-navbar"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container
        id="godown-50"
        style={{
          flex: 1,
          minHeight: "85vh",
        }}
      >
        <Alert color="danger">
          Your requested page was not found. <Link to="/">Go Home</Link>.
        </Alert>
      </Container>
      <Footer />
    </div>
  );
};

export default NotFound;
