import React from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import { CoinDonationSlider } from "../components/Slider";
import { PlayerList } from "../components/PlayerList";

export function Choice() {
  const player = usePlayer();

  function onClick(choice) {
    player.round.set("decision", choice);
    player.stage.set("submit", true);
  }

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <p>
        <strong>3.</strong> The main decision you make each round is how much to contribute to the
        <em>public good</em>. For each coin you contribute, it will be doubled and then evenly distributed among all players, rounded.
      </p>

      <p>
        <strong>4.</strong> There are three other things you can do each round:
      </p>

      <p>
        <strong>4.1</strong> Pay 1 coin to monitor another player. When you monitor another player,
        you will learn how many coins they contributed immediately prior to the following round.
      </p>

      <p>
        <strong>4.2</strong> Pay 1 coin to punish another player. Players who are punished will
        lose 5 coins immediately prior to the following round.
      </p>

      <p>
        <strong>4.3</strong> Transfer up to 5 coins to another player. The other player will
        receive your transfer immediately prior to the following round.
      </p>

      <Scoreboard />

      <div className="flex w-sw justify-center">
        <div className="p-10">
          <h1 className="text-xl font-bold">Who would you like to Monitor?</h1>
          <PlayerList />
        </div>
        <div className="p-6">
          <CoinDonationSlider maxCoins={20} />
        </div>
      </div>
    </div>
  );
}
