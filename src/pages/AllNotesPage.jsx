import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/AllNotesPage.css";
import { useAuth } from "../components/AuthContext";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;
const API_TOKEN = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_URL = "https://api.themoviedb.org/3";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/v1/note`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.status === 200) {
          const notesData = response.data || [];

          // Fetch poster paths for each note using TMDB ID
          const notesWithPosters = await Promise.all(
            notesData.map(async (note) => {
              try {
                const tmdbResponse = await axios.get(
                  `${TMDB_URL}/movie/${note.tmdb_id}?language=en-US`,
                  {
                    headers: {
                      accept: "application/json",
                      Authorization: `Bearer ${API_TOKEN}`,
                    },
                  },
                );
                return {
                  ...note,
                  poster_path: tmdbResponse.data.poster_path || null,
                };
              } catch (err) {
                console.error(
                  `Failed to fetch poster for TMDB ID ${note.tmdb_id}`,
                  err,
                );
                return { ...note, poster_path: null };
              }
            }),
          );

          setNotes(notesWithPosters);
          setFilteredNotes(notesWithPosters);
        } else {
          console.error("Failed to fetch notes:", response);
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
      }
    };

    fetchNotes();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredNotes(
      notes.filter((note) => note.movieTitle.toLowerCase().includes(term)),
    );
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setSelectedNote(null);
  };

  return (
    <div className="notes-container">
      <h1>{user.username}&apos;s Notes</h1>

      <div className="notes-search">
        <input
          type="text"
          placeholder="Search by movie title..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="notes-grid">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="note-card"
              onClick={() => handleNoteClick(note)}
            >
              {note.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${note.poster_path}`}
                  alt={note.movieTitle}
                />
              ) : (
                <div style={{ height: "300px", background: "#ccc" }}>
                  No Image
                </div>
              )}
              <p>{note.movieTitle}</p>
              <p>
                {note.created_at
                  ? new Date(note.created_at).toLocaleDateString()
                  : ""}
              </p>
            </div>
          ))
        ) : (
          <p>No notes found.</p>
        )}
      </div>

      {showSidebar && selectedNote && (
        <div className="sidebar">
          <button onClick={closeSidebar} className="close-btn">
            ✖
          </button>
          <h2>{selectedNote.movieTitle}</h2>
          {selectedNote.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w300${selectedNote.poster_path}`}
              alt={selectedNote.movieTitle}
            />
          )}
          <p>
            <strong>Date:</strong>{" "}
            {selectedNote.created_at
              ? new Date(selectedNote.created_at).toLocaleString()
              : ""}
          </p>
          <p>
            <strong>{user.username}&apos; Notes:</strong>
          </p>
          <p style={{ whiteSpace: "pre-line" }}>{selectedNote.content}</p>
          <Link to={`/notes/edit/${selectedNote.id}`}>
            <button className="notes-button">✏️ Edit Note</button>
          </Link>
        </div>
      )}
    </div>
  );
}
