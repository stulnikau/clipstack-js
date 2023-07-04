import React, { useEffect, useState } from "react";

import {
  Alert,
  Container,
  Input,
  Row,
  Col,
  Button,
  FormGroup,
  Spinner,
} from "reactstrap";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";

import "./styles/GoDown.css";
import { useNavigate } from "react-router";
import Footer from "../components/Footer";

const API_URL = "http://sefdb02.qut.edu.au:3000/movies/search";

const Search = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchYear, setSearchYear] = useState("Any year");
  const [gridApi, setGridApi] = useState(null);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [numResults, setNumResults] = useState(0);

  const handleSubmit = () => {
    const searchItems = [];
    if (searchTitle) {
      searchItems.push("title=" + searchTitle);
    }
    if (searchYear && searchYear !== "Any year") {
      searchItems.push("year=" + searchYear);
    }
    setSearch(searchItems);
  };

  const columnDefs = [
    {
      headerName: "",
      maxWidth: 60,
      // it is important to have node.id here, so that when the id changes (which happens
      // when the row is loaded) then the cell is refreshed.
      valueGetter: "node.id",
      cellRenderer: (props) => {
        if (props.value !== undefined) {
          return parseInt(props.value) + 1;
        } else {
          return (
            <Spinner color="primary" size="sm">
              Loading...
            </Spinner>
          );
        }
      },
    },
    { headerName: "ID", field: "imdbID", hide: true },
    { headerName: "Title", field: "title", flex: 4 },
    { headerName: "Year", field: "year", flex: 1 },
    { headerName: "IMDB Rating", field: "imdbRating", flex: 2 },
    { headerName: "RottenTomatoes", field: "rottenTomatoesRating", flex: 2 },
    { headerName: "Metacritic", field: "metacriticRating", flex: 2 },
    { headerName: "Rated", field: "classification", flex: 2 },
  ];

  const createDataSource = async () => {
    const dataSource = {
      getRows: (params) => {
        let page = params.startRow / 100 + 1;
        let searchParams = search.join("&");
        if (searchParams !== "") {
          searchParams = searchParams + "&";
        }
        let url = API_URL + "?" + searchParams + "page=" + page;
        setError(null);
        setIsEmpty(true);
        setIsLoading(true);
        fetch(url)
          .then((response) => response.json())
          .then((response) => {
            if (response.data.length > 0) {
              if (response.pagination.total !== numResults) {
                setNumResults(response.pagination.total);
              }
              setIsEmpty(false);
            }
            if (response.pagination.total === 0) {
              setNumResults(0);
            }
            params.successCallback(response.data, response.pagination.total);
          })
          .catch((error) => {
            setError(error);
            setNumResults(0);
            params.successCallback([], 0);
          })
          .finally(() => setIsLoading(false));
      },
    };
    return dataSource;
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    createDataSource().then((dataSource) =>
      params.api.setDatasource(dataSource)
    );
  };

  const fetchData = () => {
    createDataSource().then((dataSource) => {
      if (gridApi) {
        gridApi.setDatasource(dataSource);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const years = [];
  years.push(<option key="any">Any year</option>);
  for (let i = 2023; i >= 1990; i--) {
    years.push(<option key={i}>{i}</option>);
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
          <Col xs={12}>
            <h2 className="text-center">Search movie titles</h2>
            <Row>
              <Col xs={8}>
                <FormGroup>
                  <Input
                    type="text"
                    placeholder="Search titles..."
                    style={{
                      marginTop: "10px",
                      marginBottom: "10px",
                    }}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col xs={2}>
                <FormGroup>
                  <Input
                    placeholder="Any year"
                    type="select"
                    style={{
                      marginTop: "10px",
                      marginBottom: "10px",
                    }}
                    onChange={(e) => setSearchYear(e.target.value)}
                  >
                    {years.map((year) => {
                      return year;
                    })}
                  </Input>
                </FormGroup>
              </Col>
              <Col xs={2}>
                <FormGroup>
                  <Button
                    color="primary"
                    style={{
                      marginTop: "10px",
                      marginBottom: "10px",
                    }}
                    onClick={handleSubmit}
                  >
                    Search
                  </Button>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div
                  className="ag-theme-balham"
                  style={{
                    height: "500px",
                    width: "100%",
                  }}
                >
                  {error && !isLoading && (
                    <Alert color="danger">
                      There was an error loading the titles.
                    </Alert>
                  )}
                  {!error && isEmpty && !isLoading && (
                    <Alert color="secondary">
                      No titles found for your search.
                    </Alert>
                  )}
                  {numResults > 0 && (
                    <h6 style={{ color: "gray" }}>
                      Showing {numResults} results
                    </h6>
                  )}
                  {
                    <AgGridReact
                      columnDefs={columnDefs}
                      onRowClicked={(e) =>
                        navigate("/movie?imdbID=" + e.data.imdbID)
                      }
                      rowModelType="infinite"
                      onGridReady={onGridReady}
                      infiniteInitialRowCount={100}
                      blockLoadDebounceMillis={500}
                    />
                  }
                </div>
              </Col>
            </Row>
          </Col>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default Search;
