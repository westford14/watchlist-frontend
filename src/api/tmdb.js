import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

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
