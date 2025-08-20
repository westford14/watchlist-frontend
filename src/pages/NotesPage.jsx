import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import "../styles/NotesPage.css";
import { v4 as uuidv4 } from "uuid";

const API_TOKEN = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_URL = "https://api.themoviedb.org/3";
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export default function NotesPage() {
  const { tmdbId } = useParams();
  const { user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [notes, setNotes] = useState("");
  const [oldNote, setOldNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(
          `${TMDB_URL}/movie/${tmdbId}?language=en-US`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${API_TOKEN}`,
            },
          },
        );
        setMovie(response.data);
      } catch (err) {
        console.error("Failed to fetch movie:", err);
      }
    };

    fetchMovie();
  }, [tmdbId]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/v1/note/${tmdbId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.status === 200 && response.data?.note) {
          setNotes(response.data.note);
          setOldNote(response.data);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setNotes("");
          setOldNote(null);
        } else {
          console.error("Failed to fetch notes:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [tmdbId, user.token]);

  const handleSave = async () => {
    try {
      if (oldNote === null) {
        var note_id = uuidv4();
        var exists = false;
      } else {
        note_id = oldNote.id;
        exists = true;
      }
      if (exists) {
        var route = `${BASE_URL}/v1/note/${tmdbId}`;
      } else {
        route = `${BASE_URL}/v1/note`;
      }
      const response = await axios.post(
        route,
        {
          id: note_id,
          username: user.username,
          tmdb_id: Number(tmdbId),
          note: notes,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (response.status === 201 || response.status == 200) {
        alert("Notes saved successfully!");
      } else {
        alert("Failed to save notes.");
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Error saving notes.");
    }
  };

  if (!movie || isLoading) return <p>Loading...</p>;

  return (
    <div className="notes-container">
      <h1>{movie.title}</h1>
      <img
        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
        alt={movie.title}
        className="notes-poster"
      />
      <p>
        <strong>Runtime:</strong> {movie.runtime} mins
      </p>
      <p>
        <strong>Overview:</strong> {movie.overview}
      </p>

      <div className="notes-editor">
        <h2>Your Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your thoughts about the movie..."
        />
        <button onClick={handleSave}>Save Notes</button>
      </div>
    </div>
  );
}
