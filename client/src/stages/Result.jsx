import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";
import { Scoreboard } from "../components/Scoreboard";

export function Result() {
  const player = usePlayer();
  const players = usePlayers();
  //p.round.get ???
  const totalDonatedCoins = players.reduce((sum, p) => sum + (p.round.get("donation") || 0), 0);
  //const share = players.length > 0 ? totalCoins / players.length : 0;
  //player.set("coins", (share + numCoins));
  
  //const totalDonatedCoins = player.get("coins");
  //const share = 3;
  const share = player.round.get("share");
  const numPunishments = player.round.get("punishment");

  return (
    <div>
      <p>{`You donated: ${player.round.get("donation")}`}</p>
      <p>{`The pool donated: ${totalDonatedCoins}`}</p>
      <p>{`You receive: ${share} coins!`}</p>
      <p>{`You were punished: ${numPunishments} times, resulting in a loss of ${numPunishments * 5} coins!`}</p>

{/*       <br />
      <p>{`You get ${player.round.get("score")} months in jail!`}</p> */}
      <Scoreboard />
      <Button handleClick={() => player.stage.set("submit", true)}>
        Play Again
      </Button>
    </div>
  );
}
