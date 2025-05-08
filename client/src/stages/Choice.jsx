import React from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import { CoinContributionSlider } from "../components/Slider";
import { PlayerList } from "../components/PlayerList";

export function Choice() {
  const player = usePlayer();
  const numCoins = player.get("coins");
  //function onClick(choice) {
  //  player.round.set("decision", choice);
  //  player.stage.set("submit", true);
  //}

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <p>
        How much would you like to contribute to the 
        <em> public good</em>? For each coin you contribute, it will be doubled and then evenly distributed among all players, rounded.
      </p>

      <Scoreboard />

      <div className="flex w-sw justify-center">
        <div className="p-6">
          <CoinContributionSlider max = {numCoins}/>
        </div>
      </div>
    </div>
  );
}
