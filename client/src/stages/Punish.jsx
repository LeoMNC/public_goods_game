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

  // number of targets selected
  const cost = punishedIds.length;
  // total penalty inflicted on targets
  const penalty = cost * PUNISH_MULTIPLIER;

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
    // Ensure punisher can pay the base cost only
    if (tokens < cost) {
      setError(`Not enough tokens. You have ${tokens}, need ${cost}.`);
      return;
    }

    // 1) Record the raw array of punished IDs
    currentPlayer.round.set("givenPunishments", punishedIds);
    // 2) Record the punishment cost on this player
    currentPlayer.round.set("punishmentCost", cost);
    // 3) Record the eventual total penalty inflicted
    currentPlayer.round.set("punishmentPenalty", penalty);

    // 4) Advance to next stage so server handles punish logic
    currentPlayer.stage.set("submit", true);

    // 5) Reset local state & errors for next usage
    setPunishedIds([]);
    setError(null);
  }, [currentPlayer, punishedIds, cost, penalty]);

  return { players, punishedIds, error, cost, penalty, togglePunish, submitPunishment };
}

function PunishmentComponent() {
  const { players, punishedIds, error, cost, penalty, togglePunish, submitPunishment } =
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
                {p.get("name")} ({p.id})
              </label>
            </li>
          ))}
      </ul>

      <div className="mt-4">
        <p>
          <strong>Cost:</strong> {cost} token{cost !== 1 && "s"}
        </p>
        <p>
          <strong>Penalty inflicted:</strong> {penalty} total
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
        <strong>4.2.</strong> Pay 1 token per punishment. Punished players lose 5 tokens per hit before the next round.
      </p>
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-md">
          <PunishmentComponent />
        </div>
      </div>
    </div>
  );
}
