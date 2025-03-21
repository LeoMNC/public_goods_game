import React, { useState, useEffect } from "react";
import { usePlayers, usePlayer } from "@empirica/core/player/classic/react";

export function PunishmentComponent() {
  const players = usePlayers(); // Get all players
  const currentPlayer = usePlayer(); // Get the current player
  const [punishedPlayers, setPunishedPlayers] = useState([]); // State to track selected players
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("All players:", players); // Log all player objects
  }, [players]); // Runs whenever players update

  const handleCheckboxChange = (playerId, isChecked) => {
    if (isChecked) {
      // Add the player to punished list
      setPunishedPlayers((prev) => [...prev, playerId]);
    } else {
      // Remove the player from punished list
      setPunishedPlayers((prev) => prev.filter((id) => id !== playerId));
    }
  };

  const handlePunishClick = () => {
    const punishmentCost = punishedPlayers.length;
    const playerCoins = currentPlayer.get("coins") || 0;

    if (playerCoins >= punishmentCost) {
      punishedPlayers.forEach((playerId) => {
        const player = players.find((p) => p.id === playerId);
        if (player) {
          const currentPunishment = player.round.get("punishment") || 0;
          player.round.set("punishment", currentPunishment + 1); // Increase punishment count
        }
      });
      currentPlayer.set("coins", playerCoins - punishmentCost); // Deduct cost
      currentPlayer.stage.set("submit", true);
      setError(null); // Clear any previous errors
    } else {
      setError("Error! Not enough coins.");
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold">Punish Players</h2>
      <ul className="list-disc pl-5">
        {players
          .filter((p) => p.id !== currentPlayer?.id) // Exclude the current player
          .map((player) => (
            <li key={player.id} className="flex items-center">
              <input
                type="checkbox"
                id={`player-${player.id}`}
                onChange={(e) =>
                  handleCheckboxChange(player.id, e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor={`player-${player.id}`}>{player.get("name")}</label>
            </li>
          ))}
      </ul>
      <p className="mt-2">Punishment cost: {punishedPlayers.length} coins</p>
      {error && <p className="text-red-600 font-bold">{error}</p>}
      <button
        onClick={handlePunishClick}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
      >
        Punish
      </button>
    </div>
  );
}
