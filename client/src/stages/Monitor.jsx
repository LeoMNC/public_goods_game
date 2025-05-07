import React, { useState } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";

export function Monitor() {
  const player = usePlayer();
  const players = usePlayers().filter(p => p.id !== player.id); // Exclude self
  const [selected, setSelected] = useState([]);

  const handleSubmit = () => {
    // Deduct 1 coin per monitored player
    const cost = selected.length;
    player.set("coins", player.get("coins") - cost);
    
    // Save monitored players to round data
    player.round.set("monitored", selected);
    player.stage.submit();
  };

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <p className="mb-4">
        Pay 1 coin per player to see their <strong>previous contribution</strong>.
      </p>

      <div className="mb-4">
        <strong>Your coins:</strong> {player.get("coins")}
      </div>

      <div className="space-y-2 mb-8">
        {players.map((p) => (
          <label key={p.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={(e) => {
                const newSelected = e.target.checked
                  ? [...selected, p.id]
                  : selected.filter(id => id !== p.id);
                setSelected(newSelected);
              }}
            />
            Monitor {p.id} (Cost: 1 coin)
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit Monitoring Choices
      </button>
    </div>
  );
}