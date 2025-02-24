import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";
import { Scoreboard } from "../components/Scoreboard";

export function Result() {
  const player = usePlayer();
  const players = usePlayers();
  const numCoins = player.round.get("coins");
  //p.round.get ???
  const totalCoins = players.reduce((sum, p) => sum + (p.get("donation") || 0), 0);
  const share = players.length > 0 ? totalCoins / players.length : 0;
  player.set("coins", (share + numCoins));
  return (
    <div>
      <p>{`You donated: ${player.round.get("donation")}`}</p>
      <p>{`The pool donated: ${totalCoins}`}</p>
      <p>{`You receive: ${share} coins!`}</p>

{/*       <br />
      <p>{`You get ${player.round.get("score")} months in jail!`}</p> */}
      <Scoreboard />
      <Button handleClick={() => player.stage.set("submit", true)}>
        Play Again
      </Button>
    </div>
  );
}
