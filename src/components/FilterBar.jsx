import React from "react";

const MIN = 0;
const MAX = 300;
const STEP = 10;

// eslint-disable-next-line react/prop-types
export default function FilterBar({ maxRuntime, setMaxRuntime }) {
  const handleChange = (e) => {
    setMaxRuntime(Number(e.target.value));
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: "0 1rem",
        color: "#eee",
      }}
    >
      <label
        htmlFor="max-runtime"
        style={{ display: "block", marginBottom: 8, textAlign: "center" }}
      >
        Max Runtime: {maxRuntime} mins
      </label>
      <input
        id="max-runtime"
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={maxRuntime}
        onChange={handleChange}
        style={{ width: "100%", cursor: "pointer" }}
      />
    </div>
  );
}
