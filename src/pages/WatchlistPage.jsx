import { useEffect, useState } from "react";
import { fetchPopularMovies } from "../api/tmdb";
import FilterBar from "../components/FilterBar";
import "../styles/App.css";

export default function WatchlistPage() {
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [maxRuntime, setMaxRuntime] = useState(300);

  useEffect(() => {
    fetchPopularMovies().then(setMovies);
    const saved = localStorage.getItem("watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  const addToWatchlist = (movie) => {
    const exists = watchlist.find((m) => m.id === movie.id);
    if (!exists) {
      const updated = [...watchlist, movie];
      setWatchlist(updated);
      localStorage.setItem("watchlist", JSON.stringify(updated));
    }
  };

  const assignMockRuntimes = (movies) =>
    movies.map((movie) => ({
      ...movie,
      runtime: Math.floor(Math.random() * 180) + 60,
    }));

  const moviesWithRuntimes = assignMockRuntimes(movies);
  const filteredMovies = moviesWithRuntimes.filter(
    (m) => m.runtime <= maxRuntime,
  );

  return (
    <div className="container">
      <h1>Filterable Watchlist</h1>

      <FilterBar maxRuntime={maxRuntime} setMaxRuntime={setMaxRuntime} />

      <div className="movie-grid">
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => addToWatchlist(movie)}
          >
            <img
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
            />
            <p>{movie.title}</p>
            <p>{movie.runtime} mins</p>
          </div>
        ))}
      </div>
    </div>
  );
}
