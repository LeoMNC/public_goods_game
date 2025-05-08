import React from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import { CoinContributionSlider } from "../components/Slider";

export function Contribution() {
  const player = usePlayer();
  const numCoins = player?.get("coins") ?? 10;
  
  console.log("Rendering Contribution stage, coins:", numCoins);

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h1 className="text-2xl font-bold mb-4">Contribution Stage</h1>
      
      <p className="mb-4">
        How much would you like to contribute to the{" "}
        <em>public good</em>? For each coin you contribute, it will be doubled and then evenly distributed among all players, rounded.
      </p>

      <Scoreboard />

      <div className="flex justify-center w-full mt-6">
        <div className="w-full max-w-md p-4">
          <CoinContributionSlider 
            min={0}
            max={numCoins} 
            step={1}
          />
        </div>
      </div>
    </div>
  );
}