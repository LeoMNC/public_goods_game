import {
  usePlayer,
  usePlayers,
  useRound,
  useStage,
} from "@empirica/core/player/classic/react";
import { Loading } from "@empirica/core/player/react";
import React from "react";
import { Choice } from "./stages/Choice";
import { Result } from "./stages/Result";
import { Monitor } from "./stages/Monitor";
import { Punish } from "./stages/Punish";
import { Transfer } from "./stages/Transfer";


export function Stage() {
  const player = usePlayer();
  const players = usePlayers();
  const round = useRound();
  const stage = useStage();

  if (player.stage.get("submit")) {
    if (players.length === 1) {
      return <Loading />;
    }

    return (
      <div className="text-center text-gray-400 pointer-events-none">
        Please wait for other player(s).
      </div>
    );
  }

  switch (stage.get("name")) {
    case "choice":
      return <Choice />;
    case "result":
      return <Result />;
    case "monitor":
      return <Monitor />;
    case "punish":
      return <Punish />;
    case "transfer":
      return<Transfer />;
    default:
      return <p>Loading...</p>;
  }
}
