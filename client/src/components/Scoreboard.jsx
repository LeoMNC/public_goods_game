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
            <span className="font-medium">Your Tokens:</span>
            <span className="font-semibold">{tokens}</span>
          </div>
          
          <div className="flex justify-between text-base">
            <span className="font-medium">Last Contribution:</span>
            <span className="font-semibold">{contribution}</span>
          </div>
          
          <div className="flex justify-between text-base">
            <span className="font-medium">Total Group:</span>
            <span className="font-semibold">{totalDonated}</span>
          </div>
          
          {/* Optional progress bar visualization */}
          <div className="pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: '${players.length ? Math.min(100, (contribution / (tokens + contribution)) * 100 : 0}%'
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              Your contribution: {contribution} / {tokens + contribution}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}