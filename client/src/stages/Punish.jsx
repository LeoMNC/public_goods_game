import React from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import { PlayerList } from "../components/PlayerList";
import { PunishmentComponent } from "../components/PunishmentComponent";

export function Punish() {
  const player = usePlayer();

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <p>
        <strong>4.2</strong> Pay 1 coin to punish another player. Players who are punished will
        lose 5 coins immediately prior to the following round.
      </p>
      <Scoreboard />
      <div className="flex w-sw justify-center">
        <div className="p-10">
          <h1 className="text-xl font-bold">Who would you like to Punish?</h1>
          <PunishmentComponent />
        </div>
      </div>
    </div>
  );
}
