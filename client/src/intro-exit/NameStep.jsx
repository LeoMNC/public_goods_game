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
      next(); // Proceed to next intro step
    } else {
      setError("Username must be more than one character");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isValidName) {
      handleSubmit();
      } else {
        setError("Username must be more than one character");
    }
    }
  };

  const handleChange = (e) => {
    setName(e.target.value);
    if (error) setError(""); // Clear error when user types
  };

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        What's your name?
      </h3>
      <input
        type="text"
        className={`mt-4 mb-2 p-2 border rounded w-full max-w-md ${
          error ? "border-red-500" : ""
        }`}
        value={name}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter your name"
      />
      {/* Error message container with fixed height */}
      <div className="h-6 mb-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <Button
        handleClick={handleSubmit}
        disabled={!isValidName}
        className={!isValidName ? "opacity-50 cursor-not-allowed" : ""}
      >
        <p>Continue</p>
      </Button>
    </div>
  );
}