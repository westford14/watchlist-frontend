import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import FilterBar from "../components/FilterBar";
import "../styles/App.css";
import { useAuth } from "../components/AuthContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function WatchlistPage() {
  const [movies, setMovies] = useState([]);
  const [maxRuntime, setMaxRuntime] = useState(450);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const filteredMovies = movies
    .filter((m) => m.runtime <= maxRuntime)
    .sort((a, b) => b.vote_average - a.vote_average);

  return (
    <div className="container">
      <h1>Filterable Watchlist</h1>

      <FilterBar maxRuntime={maxRuntime} setMaxRuntime={setMaxRuntime} />

      <div className="movie-grid">
        {filteredMovies.map((movie) => (
          <Link
            to={`https://letterboxd.com/${movie.url}`}
            key={movie.id}
            className="movie-card"
          >
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
            />
            <p>{movie.title}</p>
            <p>{movie.runtime} mins</p>
            <p>⭐ {movie.vote_average.toFixed(1)}</p>
          </Link>
        ))}
      </div>

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
