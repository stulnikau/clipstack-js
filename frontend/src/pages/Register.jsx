import React, { useState } from "react";
import {
  Container,
  Form,
  FormGroup,
  Button,
  Input,
  FormFeedback,
  Alert,
} from "reactstrap";
import { Link } from "react-router-dom";

import "./styles/Common.css";
import "./styles/GoDown.css";

import Background from "../assets/bg_lg.jpg";
import Footer from "../components/Footer";
import Tick from "../components/Tick";

const API_URL = "https://localhost:3001";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [feedback, setFeedback] = useState({ message: "", error: false });

  const registerUser = (email, password) => {
    const url = `${API_URL}/user/register`;

    setFeedback({ message: "", error: false });
    return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((res) => res.json())
      .then((res) => {
        setFeedback({ message: res.message, error: res.error });
      })
      .catch((error) => {
        setFeedback({ message: error.message, error: true });
      });
  };

  const passwordsDoNotMatch = () => {
    return repeatPassword && password !== repeatPassword;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordsDoNotMatch()) {
      setFeedback({ message: "Passwords do not match", error: true });
      return;
    }
    if (!email || !password || !repeatPassword) {
      setFeedback({ message: "Please enter all details", error: true });
      return;
    }
    if (!email.includes("@")) {
      setFeedback({
        message: "Please enter a valid email address",
        error: true,
      });
      return;
    }
    registerUser(email, password);
  };

  var bgStyle = {
    backgroundImage: `url(${Background})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    width: "100vw",
    height: "100vh",
  };

  let content = null;

  if (feedback.message && !feedback.error) {
    content = (
      <Container className="text-center" flexDirection="vertical">
        <Tick />
        <h5 className="text-center" style={{ marginTop: "15px" }}>
          {feedback.message}. <Link to="/login">Login</Link>.
        </h5>
      </Container>
    );
  } else {
    content = (
      <Form>
        {feedback.error && (
          <FormGroup>
            <Alert color="danger">Cannot register. {feedback.message}</Alert>
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
            invalid={email && !email.includes("@")}
          />
          {email && !email.includes("@") && (
            <FormFeedback>Enter a valid email</FormFeedback>
          )}
        </FormGroup>
        <FormGroup>
          <Input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            valid={password.length > 0}
          />
        </FormGroup>
        <FormGroup>
          <Input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            placeholder="Confirm password"
            onChange={(e) => setRepeatPassword(e.target.value)}
            valid={repeatPassword && !passwordsDoNotMatch()}
            invalid={passwordsDoNotMatch()}
          />
          {passwordsDoNotMatch() && (
            <FormFeedback>Passwords do not match</FormFeedback>
          )}
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
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </Container>
          <Button
            type="submit"
            disabled={
              passwordsDoNotMatch() ||
              !email.includes("@") ||
              !password ||
              !repeatPassword
            }
            onClick={handleSubmit}
          >
            Register
          </Button>
        </div>
      </Form>
    );
  }

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
            <h1 className="text-center">Register</h1>
            {content}
          </Container>
        </div>
        <Footer dark />
      </div>
    </div>
  );
};

export default Register;
