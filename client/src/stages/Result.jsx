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

      <p>You contributed <strong>{contribution.toFixed(2)}</strong> of your 10 coins.</p>
      <p>On average, players contributed <strong>{meanContribution.toFixed(2)}</strong> coins.</p>
      <p>In total, <strong>{players.length}</strong> players contributed <strong>{totalContribution.toFixed(2)}</strong> coins.</p>
      <p>This was multiplied by 1.5 to get <strong>{totalPool.toFixed(2)}</strong> coins back.</p>
      <p>Each player, including you, receives <strong>{share.toFixed(2)}</strong> coins.</p>
      <p>In total, you contributed <strong>{contribution.toFixed(2)}</strong> coins and got <strong>{share.toFixed(2)}</strong> back.</p>
      <p>On net, this results in a difference of <strong>{(share - contribution).toFixed(2)}</strong> coins.</p>
      <p>Counting the coins you kept, you earned a total of <strong>{player.get("coins").toFixed(2)}</strong> coins this round.</p>

      {/* <hr className="my-4" />
      <h3 className="mt-4 text-lg font-semibold">Group Contributions:</h3>
      <ul className="mt-2 text-left mx-auto max-w-sm">
        {players.map((p) => (
          <li key={p.id}>
            Player {p.id === player.id ? "(You)" : p.id.slice(-4)} contributed:{" "}
            <strong>{(p.round.get("contribution") || 0).toFixed(2)}</strong> coins
          </li>
        ))}
      </ul> */}

      <Button handleClick={() => player.stage.set("submit", true)} className="mt-6">
        Continue
      </Button>
    </div>
  );
}
