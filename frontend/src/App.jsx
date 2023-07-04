import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Movie from "./pages/Movie";
import Person from "./pages/Person";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import { Toaster, toast } from "react-hot-toast";

function App() {
  const navigate = useNavigate();

  const logout = () => {
    fetch("https://localhost:3001/user/logout", {
      method: "POST",
      body: JSON.stringify({
        refreshToken: window.localStorage.getItem("refreshToken"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          throw new Error(res.message);
        }
      })
      .finally(() => {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("storage"));
        toast.success("Successfully logged out");
        navigate("/");
      });
  };

  return (
    <>
      <Toaster />
      <Navigation logoutAction={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie" element={<Movie />} />
        <Route path="/person" element={<Person />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
