// client/src/stages/Punish.jsx
import React, { useState, useCallback } from "react";
import { usePlayers, usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";

export function usePunishment() {
  const players = usePlayers();
  const currentPlayer = usePlayer();
  const [punishedIds, setPunishedIds] = useState([]);
  const [error, setError] = useState(null);
  const cost = punishedIds.length;

  const togglePunish = useCallback((playerId) => {
    setPunishedIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  }, []);

  const submitPunishment = useCallback(() => {
    if (!currentPlayer) return;

    const tokens = currentPlayer.get("tokens") || 0;
    if (tokens < cost) {
      setError(`Not enough tokens. You have ${tokens}, need ${cost}.`);
      return;
    }

    currentPlayer.round.set("givenPunishments", punishedIds);
    currentPlayer.stage.set("submit", true);
    setError(null);
  }, [punishedIds, cost, currentPlayer]);

  return { players, punishedIds, error, cost, togglePunish, submitPunishment };
}

function PunishmentComponent() {
  const { players, punishedIds, error, cost, togglePunish, submitPunishment } = usePunishment();
  const currentPlayer = usePlayer();

  return (
    <div className="p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Select Players to Punish</h2>
      <ul className="space-y-2">
        {players.filter((p) => p.id !== currentPlayer?.id).map((p) => (
          <li key={p.id} className="flex items-center">
            <input
              type="checkbox"
              id={`punish-${p.id}`}
              checked={punishedIds.includes(p.id)}
              onChange={() => togglePunish(p.id)}
              className="mr-3"
            />
            <label htmlFor={`punish-${p.id}`}>
              {p.get("name")} ({p.id})
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
        className="mt-6 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
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
        <strong>4.2.</strong> Pay 1 token to punish another player. Punished players lose 5 tokens before the next round.
      </p>
      <Scoreboard />
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-md">
          <PunishmentComponent />
        </div>
      </div>
    </div>
  );
}