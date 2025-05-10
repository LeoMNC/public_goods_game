import {
  usePlayer,
  usePlayers,
  useRound,
  useStage,
} from "@empirica/core/player/classic/react";
import { Loading } from "@empirica/core/player/react";
import React from "react";
import { Contribution } from "./stages/Contribution";
import { Result } from "./stages/Result";
import { Monitor } from "./stages/Monitor.jsx";
import { Intermission } from "./stages/Intermission.jsx";
import { Punish } from "./stages/Punish.jsx";
import { Transfer } from "./stages/Transfer.jsx";
import { Credits } from "./stages/Credits.jsx";
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
    case "contribution":
      return <Contribution />;
    case "result":
      return <Result />;
    case "monitor":
      return <Monitor />;
    case "intermission":
      return <Intermission />;
    case "punish":
      return <Punish />;
    case "transfer":
      return <Transfer />;
    case "credits":
      return <Credits />;
    default:
      console.error(`Unknown stage: ${stage.get("name")}`);
      return <Loading />;
  }
}
