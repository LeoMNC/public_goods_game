import React, { useEffect, useState } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";

export function Scoreboard() {
  const player = usePlayer();
  const players = usePlayers();
  const [totalDonated, setTotalDonated] = useState(0);

  // Safely get values with fallbacks
  const tokens = player?.get("tokens") ?? 0;
  const contribution = player?.round?.get("contribution") || 0;

  useEffect(() => {
    if (!players) return;
    
    const total = players.reduce((acc, p) => {
      return acc + (p.round?.get("contribution") || 0);
    }, 0);
    
    setTotalDonated(total);
  }, [players]);

  return (
    <div className="flex justify-center w-full mb-8">
      <div className="p-6 border rounded-xl w-80 shadow-md bg-white">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Scoreboard</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-base">
            <span className="font-medium">Your Contribution:</span>
            <span className="font-semibold">{contribution}</span>
          </div>
          
          <div className="flex justify-between text-base">
            <span className="font-medium">Group Contribution:</span>
            <span className="font-semibold">{totalDonated}</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}