import React, { useState } from "react";

export function MyPlayerForm({ onPlayerID, connecting }) {
  const [playerID, setPlayerID] = useState("");

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (!playerID || playerID.trim() === "") {
      return;
    }
    onPlayerID(playerID);
  };

  return (
    <div>
      <div>Enter your Player Identifier</div>

      <form action="#" method="POST" onSubmit={handleSubmit}>
        <fieldset disabled={connecting}>
          <label htmlFor="playerID">Identifier</label>
          <input
            id="playerID"
            name="playerID" // Ensure name attribute is present
            type="text"
            autoComplete="off"
            required
            autoFocus
            value={playerID}
            onChange={(e) => setPlayerID(e.target.value)}
          />

          <button type="submit">Enter</button>
        </fieldset>
      </form>
    </div>
  );
}