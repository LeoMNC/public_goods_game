// client/src/stages/Punish.jsx
import React, { useState, useCallback } from "react";
import { usePlayers, usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";

// Client‐side multiplier must match server
const PUNISH_MULTIPLIER = 5;

export function usePunishment() {
  const players = usePlayers();
  const currentPlayer = usePlayer();
  const [punishedIds, setPunishedIds] = useState([]);
  const [error, setError] = useState(null);

  const cost = punishedIds.length;
  const penaltyMap = Object.fromEntries(
    punishedIds.map((id) => [id, PUNISH_MULTIPLIER])
  );

  const togglePunish = useCallback((playerId) => {
    setError(null);
    setPunishedIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  }, []);

  const submitPunishment = useCallback(() => {
    if (!currentPlayer) return;

    const tokens = currentPlayer.get("tokens") || 0;
    if (tokens < cost) {
      setError(`Not enough tokens. You have ${tokens}, need ${cost}.`);
      return;
    }

    // Store who was punished and by how much
    currentPlayer.round.set("givenPunishments", punishedIds);
    currentPlayer.round.set("punishmentCost", cost);
    currentPlayer.round.set("penaltyMap", penaltyMap);


    currentPlayer.stage.set("submit", true);

    setPunishedIds([]);
    setError(null);
  }, [currentPlayer, punishedIds, cost, penaltyMap, players]);

  return {
    players,
    punishedIds,
    error,
    cost,
    penaltyMap,
    togglePunish,
    submitPunishment,
  };
}

function PunishmentComponent() {
  const { players, punishedIds, error, cost, penaltyMap, togglePunish, submitPunishment } =
    usePunishment();
  const currentPlayer = usePlayer();

  const tokens = currentPlayer.get("tokens") || 0;
  const disabled = cost > tokens;

  return (
    <div className="p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Select Players to Punish</h2>

      <Scoreboard />

      <ul className="space-y-2">
        {players
          .filter((p) => p.id !== currentPlayer.id)
          .map((p) => (
            <li key={p.id} className="flex items-center">
              <input
                type="checkbox"
                id={`punish-${p.id}`}
                checked={punishedIds.includes(p.id)}
                onChange={() => togglePunish(p.id)}
                className="mr-3"
              />
              <label htmlFor={`punish-${p.id}`}> 
                {p.get("name")} 
              </label>
            </li>
          ))}
      </ul>

      <div className="mt-4">
        <p>
          <strong>Cost:</strong> {cost} token{cost !== 1 && "s"}
        </p>
        {error && <p className="text-red-600 font-bold mt-2">{error}</p>}
      </div>

      <button
        onClick={submitPunishment}
        disabled={disabled}
        className="mt-6 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirm Punishment
      </button>
    </div>
  );
}

export function Punish() {
  return (
    <div className="mt-5 px-8 py-6 bg-white rounded-lg shadow-lg">
      <p className="mb-4">
        Select players to punish. For each player punished, you will lose 1 coin and they will lose 5 coins.
      </p>
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-md">
          <PunishmentComponent />
        </div>
      </div>
    </div>
  );
}