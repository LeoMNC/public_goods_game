import React, { useEffect, useState } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";

export function Scoreboard() {
  const player = usePlayer(); // Get the current player
  const players = usePlayers(); // Get all players
  const [totalDonated, setTotalDonated] = useState(0); // State for total coins contributed

  const coins = player.get("coins") ?? 0; // Get current player's coins, default to 0 if not found
  const last_round_contribution = player.get("last_round_contribution") ?? 0; // Get the last round's contribution, default to 0 if not found

  useEffect(() => {
    // Calculate total coins contributed by all players in the current round
    const total = players.reduce((acc, p) => acc + (p.round.get("contribution") || 0), 0);
    setTotalDonated(total); // Update total contribution state
  }, [players]); // Runs whenever players update

  return (
    <div className="p-4 border rounded-sm w-60">
      <h3 className="text-sm font-bold mb-2">Scoreboard</h3>
      <div className="flex justify-between text-sm mb-1">
        <span>Your Coins:</span>
        <span>{coins}</span> {/* Display player's coins */}
      </div>
      <div className="flex justify-between text-sm">
        <span>Your last contribution:</span>
        <span>{last_round_contribution}</span> {/* Display last round's contribution */}
      </div>
      <div className="flex justify-between text-sm">
{/* <span>Last total pool:</span>
<span>{totalDonated}</span> */}
      </div>
    </div>
  );
}
