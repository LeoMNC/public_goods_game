import React, { useState } from "react";
import { Button } from "../components/Button";

export function MyPlayerForm({ onPlayerID, connecting }) {
  const [playerID, setPlayerID] = useState("");
  const [error, setError] = useState("");

  const isValidID = playerID.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidID) {
      onPlayerID(playerID.trim());
    } else {
      setError("Please enter a valid Player ID");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  const handleChange = (e) => {
    setPlayerID(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Enter your Player ID
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            id="playerID"
            name="playerID"
            type="text"
            autoComplete="off"
            autoFocus
            value={playerID}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g. P12345"
            disabled={connecting}
            className={`w-full px-4 py-2 border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />

          <div className="h-6 mt-1 mb-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={!isValidID || connecting}
            className={`w-full py-2 rounded-lg ${
              isValidID && !connecting
                ? "bg-blue-600 text-white hover:bg-blue-700 transition"
                : "bg-blue-300 text-white cursor-not-allowed"
            }`}
          >
            <p>{connecting ? "Connecting..." : "Enter"}</p>
          </Button>
        </form>
      </div>
    </div>
  );
}
