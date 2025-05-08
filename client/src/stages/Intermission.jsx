// pages/Intermission.jsx
import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";

export function Intermission() {
  const player = usePlayer();
  const players = usePlayers();

  const monitoredIds = player.get("monitoredPlayers") || [];
  const monitoredPlayers = players.filter((p) => monitoredIds.includes(p.id));

  const handleContinue = () => {
    player.stage.set("submit", true);
  };

  return (
    <div className="mt-3 sm:mt-5 p-10">
      <Scoreboard />

      <h1 className="text-2xl font-bold mb-4">Monitoring Results</h1>

      {monitoredPlayers.length === 0 ? (
        <p className="mb-6">You chose not to monitor anyone this round.</p>
      ) : (
        <table className="table-auto border-collapse w-full mb-6">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">Player</th>
              <th className="border p-2 bg-gray-100">Donated Coins</th>
              <th className="border p-2 bg-gray-100">Monitoring Cost</th>
            </tr>
          </thead>
          <tbody>
            {monitoredPlayers.map((p) => (
              <tr key={p.id}>
                <td className="border p-2">{p.get("name")}</td>
                <td className="border p-2">{p.round.get("contribution") ?? "No data"}</td>
                <td className="border p-2">1 coin</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-empirica-600 text-white rounded-lg shadow-md hover:bg-empirica-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
