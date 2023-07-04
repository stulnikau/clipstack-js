import React, { useEffect, useState } from "react";

import "./styles/Common.css";
import "./styles/GoDown.css";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Container, Col, Spinner, Alert } from "reactstrap";

import MovieHero from "../components/MovieHero";

import { AgGridReact } from "ag-grid-react";
import Footer from "../components/Footer";

import capitalise from "../helpers/Utils";

const useMovie = ({ imdbID }) => {
  const [loading, setLoading] = useState(true);
  const [movieData, setMovieData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://localhost:3001/movies/data/" + imdbID)
      .then((res) => res.json())
      .then((data) => setMovieData(data))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [imdbID]);

  return { loading, movieData, error };
};

const Movie = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  let imdbID = searchParams.get("imdbID");

  const { loading, movieData, error } = useMovie({ imdbID });

  const columnDefs = [
    {
      headerName: "Role",
      field: "category",
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Name",
      field: "name",
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
  ];

  let content = null;

  if (loading) {
    content = <Spinner color="primary">Loading...</Spinner>;
  } else if (movieData && movieData.error) {
    content = (
      <Alert color="secondary">
        {movieData.message}. <Link to="/">Go Home</Link>.
      </Alert>
    );
  } else if (error) {
    content = (
      <Alert color="danger">
        Error occurred: {error.message} <Link to="/">Go Home</Link>.
      </Alert>
    );
  } else if (movieData) {
    const rowData = movieData.principals.map((p) => ({
      id: p.id,
      category: capitalise(p.category),
      name: p.name,
      characters: p.characters.join(", "),
    }));

    content = (
      <>
        <MovieHero movieData={movieData} />
        <h4
          style={{
            marginTop: "30px",
            marginBottom: "10px",
          }}
        >
          People
        </h4>
        <div
          className="ag-theme-balham"
          style={{
            marginBottom: "50px",
            height: "350px",
            width: "100%",
          }}
        >
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            onRowClicked={(row) => navigate("/person?id=" + row.data.id)}
          />
        </div>
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

export default Movie;
