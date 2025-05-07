import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { CoinDonationSlider } from "../components/Slider";

export function Choice() {
  const player = usePlayer();
  const players = usePlayers(); // Get all players
  const numCoins = player.get("coins") || 0;

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h3 className="text-lg font-semibold">Round Contributions</h3>
      <p className="mb-4">
        You have <strong>{numCoins}</strong> coins. Contributions are doubled and split equally.
      </p>

      <CoinDonationSlider 
        max={numCoins}
        onChange={(donation) => player.round.set("donation", donation)}
      />

      {/* Show other players (optional) */}
      <div className="mt-8">
        <h4 className="font-medium mb-2">Players in Group:</h4>
        <ul>
          {players.map((p) => (
            <li key={p.id} className="text-gray-600">
              {p.id} (Coins: {p.get("coins")})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}