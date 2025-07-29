import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import "../styles/App.css";
import { useAuth } from "../components/AuthContext";
import "../styles/Sidebar.css";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const RECOMMENDER_URL = process.env.REACT_APP_RECOMMENDER_URL;
const API_TOKEN = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_URL = "https://api.themoviedb.org/3";

export default function WatchlistPage() {
  const [movies, setMovies] = useState([]);
  const [maxRuntime, setMaxRuntime] = useState(450);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const { user } = useAuth();
  const perPage = 25;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = JSON.stringify({
          username: user.username,
          runtime: maxRuntime,
          page: page,
        });
        const loginResponse = await axios.post(BASE_URL + "/v1/movie", data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (loginResponse.status !== 200) {
          console.error(
            "Failed to fetch movies:",
            JSON.stringify(loginResponse.data),
          );
        } else {
          setMovies(loginResponse.data.data || []);
          setTotalPages(Math.ceil(loginResponse.data.total / perPage));
        }
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    };
    fetchMovies();
  }, [page]);

  const filteredMovies = movies
    .filter((m) => m.runtime <= maxRuntime)
    .sort((a, b) => b.vote_average - a.vote_average);

  const handleMovieClick = async (movie) => {
    setSelectedMovie(movie);
    setShowSidebar(true);
    try {
      const response = await axios.post(
        `${RECOMMENDER_URL}/recommend`,
        JSON.stringify({ tmdb_id: movie.tmdb_id }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        const ids = response.data.data;
        console.log(ids);
        const tmdbRequests = ids.map((id) =>
          axios.get(`${TMDB_URL}/movie/${id}?language=en-US`, {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }),
        );

        const tmdbResponses = await Promise.allSettled(tmdbRequests);

        const validMovies = tmdbResponses
          .slice(1)
          .filter((res) => res.status === "fulfilled")
          .map((res) => res.value.data);

        setRecommendations(validMovies);
      } else {
        console.error("Failed to fetch recommendations:", response);
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setRecommendations([]);
    }
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSelectedMovie(null);
    setRecommendations([]);
  };

  return (
    <div className="container">
      <h1>Filterable Watchlist</h1>

      <FilterBar maxRuntime={maxRuntime} setMaxRuntime={setMaxRuntime} />

      <div className="movie-grid">
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => handleMovieClick(movie)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
            />
            <p>{movie.title}</p>
            <p>{movie.runtime} mins</p>
            <p>⭐ {movie.vote_average.toFixed(1)}</p>
          </div>
        ))}
      </div>

      {showSidebar && selectedMovie && (
        <div className="sidebar">
          <button onClick={closeSidebar} className="close-btn">
            ✖
          </button>
          <h2>
            {selectedMovie.name
              .replaceAll("-", " ")
              .replaceAll(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
          </h2>
          <img
            src={`https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`}
            alt={selectedMovie.title}
          />
          <p>
            <strong>Title:</strong>{" "}
            {selectedMovie.name
              .replaceAll("-", " ")
              .replaceAll(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
          </p>
          <p>
            <strong>Runtime:</strong> {selectedMovie.runtime} minutes
          </p>
          <p>
            <strong>Voter Average:</strong> ⭐ {selectedMovie.vote_average}
          </p>
          <Link
            to={`https://letterboxd.com/${selectedMovie.url}`}
            target="_blank"
          >
            <p>
              <strong>Letterboxd Link</strong>
            </p>
          </Link>
          {recommendations.length > 0 && (
            <div className="recommendations">
              <h3>Recommended Movies</h3>
              <div className="recommended-grid">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="recommended-card">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                      alt={rec.title}
                      className="recommended-poster"
                    />
                    <p className="recommended-title">{rec.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          style={{ marginRight: "1rem" }}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          style={{ marginLeft: "1rem" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
