import React, { useState, useEffect } from "react";

import "./styles/Common.css";
import "./styles/GoDown.css";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Container, Col, Alert, Spinner } from "reactstrap";

import { AgGridReact } from "ag-grid-react";
import Footer from "../components/Footer";

import capitalise from "../helpers/Utils";
import { toast } from "react-hot-toast";
import Chart from "../components/Chart";

const parseExpiryFromToken = (token) => {
  if (token) {
    const decodedToken = JSON.parse(window.atob(token.split(".")[1]));
    return decodedToken.exp;
  } else {
    return null;
  }
};

const personYearsString = (birthYear, deathYear) => {
  if (birthYear && deathYear) {
    return `${birthYear} – ${deathYear}`;
  } else if (birthYear) {
    return `Born ${birthYear}`;
  } else if (deathYear) {
    return `Died ${deathYear}`;
  } else {
    return "Birth year unknown";
  }
};

const usePerson = ({ personID }) => {
  const [loading, setLoading] = useState(true);
  const [personData, setPersonData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let token = window.localStorage.getItem("token");
    let refreshToken = window.localStorage.getItem("refreshToken");

    if (!token) {
      toast.error("You must be logged in to view this page");
      navigate("/login");
      return;
    }

    // Fetch person data
    const fetchPerson = async (personID, token, refreshToken) => {
      try {
        // Check if token has expired
        const tokenExp = parseExpiryFromToken(token);
        const now = new Date().getTime() / 1000;
        const hasExpired = now > tokenExp;
        // const hasExpired = true; // For testing

        if (hasExpired) {
          const response = await fetch(
            "http://sefdb02.qut.edu.au:3000/user/refresh",
            {
              method: "POST",
              body: JSON.stringify({
                refreshToken: refreshToken,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const newTokens = await response.json();
          if (!newTokens.bearerToken || !newTokens.refreshToken) {
            window.localStorage.removeItem("token");
            window.localStorage.removeItem("refreshToken");
            window.dispatchEvent(new Event("storage"));
            toast.error("Your session has expired. Please log in again");
            navigate("/login");
            return;
          }
          window.localStorage.setItem("token", newTokens.bearerToken.token);
          window.localStorage.setItem(
            "refreshToken",
            newTokens.refreshToken.token
          );
          toast.success("Your session has been refreshed");
          token = newTokens.bearerToken.token;
          refreshToken = newTokens.refreshToken.token;
        }

        // Fetch data from dataEndpoint with updated token
        const dataResponse = await fetch(
          "http://sefdb02.qut.edu.au:3000/people/" + personID,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );
        const newData = await dataResponse.json();
        setPersonData(newData);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson(personID, token, refreshToken);
  }, [personID, navigate]);

  return { loading, personData, error };
};

const Person = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  let personID = searchParams.get("id");

  const { loading, personData, error } = usePerson({
    personID,
  });

  const columnDefs = [
    {
      headerName: "Movie",
      field: "movieName",
      flex: 2,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Role",
      field: "category",
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Characters",
      field: "characters",
      flex: 2,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Rating",
      field: "imdbRating",
      flex: 1,
      filter: "agNumberColumnFilter",
      sortable: true,
    },
  ];

  let content = null;

  if (loading) {
    content = <Spinner color="primary">Loading...</Spinner>;
  } else if (personData && personData.error) {
    content = (
      <Alert color="secondary">
        {personData.message}. <Link to="/">Go Home</Link>.
      </Alert>
    );
  } else if (error) {
    content = (
      <Alert color="danger">
        Error occurred: {error.message}. <Link to="/">Go Home</Link>.
      </Alert>
    );
  } else if (personData) {
    const rowData = personData.roles.map((r) => ({
      movieName: r.movieName,
      movieId: r.movieId,
      category: capitalise(r.category),
      imdbRating: r.imdbRating,
      characters: r.characters.join(", "),
    }));

    content = (
      <>
        <h1>{personData.name}</h1>
        <h5>{personYearsString(personData.birthYear, personData.deathYear)}</h5>
        <h4
          style={{
            marginTop: "30px",
            marginBottom: "10px",
          }}
        >
          Movies
        </h4>
        <div
          className="ag-theme-balham"
          style={{
            height: "350px",
            width: "100%",
          }}
        >
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            onRowClicked={(row) =>
              navigate("/movie?imdbID=" + row.data.movieId)
            }
            pagination={true}
            paginationPageSize={10}
          />
        </div>
        <h4
          style={{
            marginTop: "30px",
            marginBottom: "10px",
          }}
        >
          IMDB Ratings at a Glance
        </h4>
        <Chart roles={personData.roles} />
      </>
    );
  }

  return (
    <div
      id="godown-navbar"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        id="godown-50"
        style={{
          flex: 1,
          minHeight: "85vh",
        }}
      >
        <Container>
          <Col>{content}</Col>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default Person;
