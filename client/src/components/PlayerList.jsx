import React, { useState, useEffect } from "react";
import { usePlayers, usePlayer } from "@empirica/core/player/classic/react";

export function PlayerList() {
  const players = usePlayers(); // Get all players
  const currentPlayer = usePlayer(); // Get the current player
  const [monitoredPlayers, setMonitoredPlayers] = useState([]); // State to track selected players
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("All players:", players); // Log all player objects
  }, [players]); // Runs whenever players update

  const handleCheckboxChange = (playerId, isChecked) => {
    if (isChecked) {
      // Add the player to monitored list
      setMonitoredPlayers((prev) => [...prev, playerId]);
    } else {
      // Remove the player from monitored list
      setMonitoredPlayers((prev) => prev.filter((id) => id !== playerId));
    }
  };

  const handleMonitorClick = () => {
    const monitoringCost = monitoredPlayers.length;
    const playerCoins = currentPlayer.get("coins") || 0;
  
    if (playerCoins >= monitoringCost) {
      monitoredPlayers.forEach((playerId) => {
        const player = players.find((p) => p.id === playerId);
        if (player) {
          player.set("monitored", true); // Optional, but if needed for reverse lookup
        }
      });
      currentPlayer.set("monitoredPlayers", monitoredPlayers); // 👈 Save who was monitored
      currentPlayer.set("coins", playerCoins - monitoringCost); // Deduct cost
      currentPlayer.stage.set("submit", true);
      setError(null);
    } else {
      setError("Error! Not enough coins.");
    }
  };
  

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold">Players in Lobby</h2>
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
      <p className="mt-2">Monitoring cost: {monitoredPlayers.length} coins</p>
      {error && <p className="text-red-600 font-bold">{error}</p>}
      <button
        onClick={handleMonitorClick}
        className="mt-4 px-4 py-2 bg-empirica-600 text-white rounded-lg shadow-md hover:bg-empirica-700 transition"
      >
        Monitor
      </button>
    </div>
  );
}

/* import React, { useState, useEffect } from "react";
import { usePlayers, usePlayer } from "@empirica/core/player/classic/react";

export function PlayerList() {
  const players = usePlayers(); // Get all players
  const currentPlayer = usePlayer(); // Get the current player
  const [monitoredPlayers, setMonitoredPlayers] = useState([]); // State to track selected players

  useEffect(() => {
    console.log("All players:", players); // Log all player objects
  }, [players]); // Runs whenever players update

  const handleCheckboxChange = (playerId, isChecked) => {
    if (isChecked) {
      // Add the player to monitored list
      setMonitoredPlayers((prev) => [...prev, playerId]);
    } else {
      // Remove the player from monitored list
      setMonitoredPlayers((prev) => prev.filter((id) => id !== playerId));
    }
  };

  const handleMonitorClick = () => {
    if (monitoredPlayers.length > 0) {
      monitoredPlayers.forEach((playerId) => {
        const player = players.find((p) => p.id === playerId);
        if (player) {
          player.set("monitored", true); // Set the player object to monitored
        }
      });
      console.log("Monitored Players:", monitoredPlayers); // Log monitored players
    }
    currentPlayer.stage.set("submit", true);
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold">Players in Lobby</h2>
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
      <button
        onClick={handleMonitorClick}
        className="mt-4 px-4 py-2 bg-empirica-600 text-white rounded-lg shadow-md hover:bg-empirica-700 transition"
      >
        Monitor
      </button>
    </div>
  );
}
 */