import React from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import { PlayerList } from "../components/PlayerList";

export function Monitor() {
  const player = usePlayer();

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <p>
        <strong>4.1</strong> Pay 1 coin to monitor another player. When you monitor another player,
        you will learn how many coins they contributed immediately prior to the following round.
      </p>

      <Scoreboard />
      <div className="flex w-sw justify-center">
        <div className="p-10">
          <h1 className="text-xl font-bold">Who would you like to Monitor?</h1>
          <PlayerList />
        </div>
      </div>
    </div>
  );
}
