import React, { useState } from "react";
import { usePlayers, usePlayer } from "@empirica/core/player/classic/react";

export function PunishmentComponent() {
  const currentPlayer = usePlayer();
  const players = usePlayers().filter(p => p.id !== currentPlayer.id);
  const [punishments, setPunishments] = useState({});

  // Treatment parameters (should come from game.treatment)
  const COST_PER_POINT = 1; 
  const PENALTY_PER_POINT = 3;

  const handlePunishChange = (playerId, points) => {
    setPunishments(prev => ({
      ...prev,
      [playerId]: Math.max(0, points) // No negative points
    }));
  };

  const handleSubmit = () => {
    // Save punishments to CURRENT player's round data
    currentPlayer.round.set("punishments", punishments);
    currentPlayer.stage.submit();
  };

  const totalCost = Object.values(punishments).reduce((sum, val) => sum + val, 0) * COST_PER_POINT;
  const canAfford = (currentPlayer.get("coins") || 0) >= totalCost;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">
        Punish Others (Cost: {COST_PER_POINT} coin/point, Penalty: {PENALTY_PER_POINT} coins/point)
      </h2>

      {players.map(player => (
        <div key={player.id} className="mb-3">
          <label className="block">
            {player.id}:
            <input
              type="number"
              min="0"
              value={punishments[player.id] || 0}
              onChange={e => handlePunishChange(player.id, +e.target.value)}
              className="ml-2 w-20 border rounded px-2"
            />
          </label>
        </div>
      ))}

      <div className="mt-4">
        <p>Total Cost: {totalCost} coins</p>
        {!canAfford && <p className="text-red-600">Not enough coins!</p>}
        <button
          onClick={handleSubmit}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
          disabled={!canAfford || totalCost === 0}
        >
          Submit Punishments
        </button>
      </div>
    </div>
  );
}