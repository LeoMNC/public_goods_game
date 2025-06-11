import React, { useEffect, useState } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";

export function Scoreboard() {
  const player = usePlayer();
  const players = usePlayers();
  const [totalDonated, setTotalDonated] = useState(0);

  const tokens = player.get("tokens") ?? 0;
  const contribution = player.round.get("contribution") || 0;

  useEffect(() => {
    const total = players.reduce((acc, p) => acc + (p.round.get("contribution") || 0), 0);
    setTotalDonated(total);
  }, [players]);

  return (
    <div className="p-6 border rounded-xl w-80 shadow-md bg-white mb-8">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Scoreboard</h3>
      <div className="flex justify-between text-base mb-2">
        <span>Your Tokens:</span>
        <span>{tokens}</span>
      </div>
      <div className="flex justify-between text-base mb-2">
        <span>Last Contribution:</span>
        <span>{contribution}</span>
      </div>
      {/* You can optionally bring this back if you'd like */}
      {/* <div className="flex justify-between text-base">
        <span>Total Group Contribution:</span>
        <span>{totalDonated}</span>
      </div> */}
    </div>
  );
}
