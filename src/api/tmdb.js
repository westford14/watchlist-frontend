import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchMovie = async (id) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}?language=en-US`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  return response.data;
};

export const fetchMovies = async (idArray) => {
  const res = await Promise.all(idArray.map((id) => fetchMovie(id)));
  return res;
};
