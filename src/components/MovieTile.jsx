export default function MovieTile({ movie, onAdd }) {
  return (
    <div
      onClick={() => onAdd(movie)}
      style={{ margin: "10px", cursor: "pointer" }}
    >
      <img
        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
        alt={movie.title}
        style={{ width: "150px" }}
      />
      <p>{movie.title}</p>
    </div>
  );
}
