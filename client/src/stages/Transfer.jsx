import React from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import { CoinDonationSlider } from "../components/Slider";
import { PlayerList } from "../components/PlayerList";

export function Transfer() {

  return (
    <div className="mt-3 sm:mt-5 p-20">

      <p>
        Transfer up to 5 coins to another player. The other player will
        receive your transfer immediately prior to the following round.
      </p>
      <Scoreboard />
      <div className="flex w-sw justify-center">
        <div className="p-10">
          <h1 className="text-xl font-bold">Who would you like to Transfer to?</h1>
          <PlayerList />
        </div>
      </div>
    </div>
  );
}
