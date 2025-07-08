// client/src/NameStep.jsx

import React, { useState } from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";

export function NameStep({ next }) {
  const player = usePlayer();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const isValidName = name.trim().length > 1;

  const handleSubmit = () => {
    if (isValidName) {
      player.set("name", name.trim());
      next();
    } else {
      setError("Username must be more than one character");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleChange = (e) => {
    setName(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          What's your name?
        </h2>
        <input
          type="text"
          className={`w-full px-4 py-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          value={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter your name"
        />
        <div className="h-6 mt-1 mb-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <Button
          handleClick={handleSubmit}
          disabled={!isValidName}
          className={`w-full py-2 rounded-lg ${
            isValidName
              ? "bg-blue-600 text-white hover:bg-blue-700 transition"
              : "bg-blue-300 text-white cursor-not-allowed"
          }`}
        >
          <p>Continue</p>
        </Button>
      </div>
    </div>
  );
}
