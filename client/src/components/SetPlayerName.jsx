import React from "react";
import { useState } from "react";
import { usePlayer } from "@empirica/core/player/classic/react";

export default function SetPlayerName({ next }) {
  const player = usePlayer();
  const [name, setName] = useState("");

  const handleSetName = () => {
    if (name.trim() !== "") {
      player.set("name", name); // Save name in player object
      next(); // Move to the next step
    } else {
      alert("Please enter a name before proceeding.");
    }
  };

  return (
    <div>
      <p>Please set a name that other players will see:</p>
      
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full mt-2"
        placeholder="Enter your name..."
      />

      <button
        onClick={handleSetName}
        autoFocus
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Next
      </button>
    </div>
  );
}
