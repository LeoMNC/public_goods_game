// client/src/components/PunishmentComponent.jsx
import React from "react";
import { usePunishment } from "../hooks/usePunishment";

export function PunishmentComponent() {
  const {
    players,
    punishedIds,
    error,
    cost,
    togglePunish,
    submitPunishment,
  } = usePunishment();

  return (
    <div className="p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Select Players to Punish</h2>

      <ul className="space-y-2">
        {players
          .filter((p) => p.id !== players.current?.id)
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
        {error && (
          <p className="text-red-600 font-bold mt-2">{error}</p>
        )}
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
