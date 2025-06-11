import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";

export function Result() {
  const player = usePlayer();
  const players = usePlayers();

  const contribution = player.round.get("contribution") || 0;
  const share = player.round.get("share") || 0;
  const totalContribution = players.reduce((sum, p) => sum + (p.round.get("contribution") || 0), 0);
  const totalPool = totalContribution * 1.5;
  const meanContribution = totalContribution / players.length;
  // const totalEarnings = newBalance - contribution;

  return (
    <div className="text-center">
      <h2>Round Results</h2>

      <p>You contributed <strong>{contribution.toFixed(2)}</strong> of your 10 tokens.</p>
      <p>On average, players contributed <strong>{meanContribution.toFixed(2)}</strong> tokens.</p>
      <p>In total, <strong>{players.length}</strong> players contributed <strong>{totalContribution.toFixed(2)}</strong> tokens.</p>
      <p>This was multiplied by 1.5 to get <strong>{totalPool.toFixed(2)}</strong> tokens back.</p>
      <p>Each player, including you, receives <strong>{share.toFixed(2)}</strong> tokens.</p>
      <p>In total, you contributed <strong>{contribution.toFixed(2)}</strong> tokens and got <strong>{share.toFixed(2)}</strong> back.</p>
      <p>On net, this results in a difference of <strong>{(share - contribution).toFixed(2)}</strong> tokens.</p>
      <p>Counting the tokens you kept, you earned a total of <strong>{player.get("tokens").toFixed(2)}</strong> tokens this round.</p>
      <Button handleClick={() => player.stage.set("submit", true)} className="mt-6">
        Continue
      </Button>
    </div>
  );
}
