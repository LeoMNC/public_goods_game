import React, { useEffect, useState } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";

export function Scoreboard() {
  const player = usePlayer(); // Get the current player
  const players = usePlayers(); // Get all players
  const [totalDonated, setTotalDonated] = useState(0); // State for total coins donated
  const coins = player.get("coins");
  /* useEffect(() => {
    // Calculate total coins donated by all players in the previous round
    const total = players.reduce((acc, p) => acc + (p.get("donation") || 0), 0);
    setTotalDonated(total); // Update total donation state
  }, [players]); // Runs whenever players update
 */
  return (
    <div className="p-4 border rounded-sm w-60">
      <h3 className="text-sm font-bold mb-2">Scoreboard</h3>
      <div className="flex justify-between text-sm mb-1">
        <span>Your Coins:</span>
        <span>{coins}</span> {/* Display player's coins */}
      </div>
      <div className="flex justify-between text-sm">
        <span>Coins Donated last round:</span>
        <span>{totalDonated}</span> {/* Display total coins donated by all players */}
      </div>
    </div>
  );
}
