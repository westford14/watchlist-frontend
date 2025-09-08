import React, { useState } from "react";
import axios from "axios";
import "../styles/SearchBar.css";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

/* eslint-disable react/prop-types */
export default function SearchBar({ user, onResults }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await axios.get(
        `${BASE_URL}/v1/movie/search?name=${encodeURIComponent(query)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.status === 200 && response.data) {
        const results = response.data || [];
        console.log(results);
        if (results.length === 0) {
          setError("No results found.");
        }
        onResults(results);
      } else {
        setError("No results found.");
        onResults([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Something went wrong.");
      onResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search your watchlist..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
      {searched && error && <p className="error-msg">{error}</p>}
    </form>
  );
}
