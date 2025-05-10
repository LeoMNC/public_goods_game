import React, { useState } from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";

export function NameStep({ next }) {
  const player = usePlayer();
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      player.set("name", name.trim());
      next(); // Proceed to next intro step
    }
  };

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        What’s your name?
      </h3>
      <input
        type="text"
        className="mt-4 mb-6 p-2 border rounded w-full max-w-md"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <Button handleClick={handleSubmit} disabled={!name.trim()}>
        <p>Continue</p>
      </Button>
    </div>
  );
}
