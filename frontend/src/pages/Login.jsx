import React, { useState } from "react";
import { Container, Form, FormGroup, Button, Input, Alert } from "reactstrap";

import "./styles/Common.css";
import "./styles/GoDown.css";

import Background from "../assets/bg_lg.jpg";
import Footer from "../components/Footer";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const API_URL = "https://localhost:3001";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loginUser = (email, password) => {
    const url = `${API_URL}/user/login`;

    setErrorMessage("");
    return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.bearerToken && res.refreshToken) {
          window.localStorage.setItem("token", res.bearerToken.token);
          window.localStorage.setItem("refreshToken", res.refreshToken.token);
          window.dispatchEvent(new Event("storage"));
          toast.success("Welcome back " + email);
          navigate(-1);
        } else {
          setErrorMessage(res.message);
        }
      })
      .catch((error) => setErrorMessage(error.message));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }
    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    loginUser(email, password);
  };

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
      <div
        id="godown-navbar"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div id="godown-100">
          <Container
            style={{
              top: "50%",
              left: "50%",
              maxWidth: "500px",
              padding: "20px",
              paddingBottom: "30px",
              borderRadius: "15px",
              backgroundColor: "rgba(255, 255, 255, 1)",
              boxShadow: "0px 0px 100px 100px rgba(0, 0, 0, 0.4)",
            }}
          >
            <h1 className="text-center">Login</h1>
            <Form>
              {errorMessage && (
                <FormGroup>
                  <Alert color="danger">{errorMessage}</Alert>
                </FormGroup>
              )}
              <FormGroup>
                <Input
                  type="email"
                  className="form-control"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  placeholder="Enter email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormGroup>
              <FormGroup className="form-group">
                <Input
                  type="password"
                  className="form-control"
                  id="exampleInputPassword1"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormGroup>
              <div style={{ display: "flex", flexDirection: "horizontal" }}>
                <Container style={{ paddingLeft: "2px" }} fluid>
                  <p
                    style={{
                      marginTop: "8px",
                      marginBottom: "8px",
                      color: "gray",
                    }}
                  >
                    Don't have an account? <Link to="/register">Register</Link>
                  </p>
                </Container>
                <Button type="submit" onClick={handleSubmit}>
                  Login
                </Button>
              </div>
            </Form>
          </Container>
        </div>
        <Footer dark />
      </div>
    </div>
  );
};

export default Login;
