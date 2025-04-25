import React, { useEffect } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";
import { Scoreboard } from "../components/Scoreboard";

export function Result() {
  const player = usePlayer();
  const players = usePlayers();

  const totalDonatedCoins = players.reduce(
    (sum, p) => sum + (p.round.get("donation") || 0),
    0
  );
  const share = player.round.get("share") || 0;
  const numPunishments = player.round.get("punishment") || 0;

  // Correctly get transfers received by this player
  const transferRecord = player.round.get("transferTo") || {};
  const transfersReceived = Object.entries(transferRecord)
    .map(([senderId, amount]) => {
      const sender = players.find(p => p.id === senderId);
      return {
        name: sender?.get("name") || "Unknown",
        amount,
      };
    })
    .filter(t => t.amount > 0);

  const totalTransferred = transfersReceived.reduce((sum, t) => sum + t.amount, 0);
  const punishmentLoss = numPunishments * 5;

  useEffect(() => {
    if (!player.round.get("coinsUpdated")) {
      const baseCoins = player.get("coins") || 0;
      const updatedCoins = baseCoins + share + totalTransferred - punishmentLoss;

      const finalCoins = Math.max(0, updatedCoins);

      player.set("coins", finalCoins);
      player.round.set("coinsUpdated", true);
    }
  }, [player, share, totalTransferred, punishmentLoss]);

  return (
    <div>
      <p>You donated: {player.round.get("donation")} coins</p>
      <p>The total pool: {totalDonatedCoins} coins</p>
      <p>You received {share} coins from the pool.</p>

      {numPunishments > 0 ? (
        <p>You were punished {numPunishments} time(s), losing {punishmentLoss} coins.</p>
      ) : (
        <p>You were not punished.</p>
      )}

      {transfersReceived.length > 0 ? (
        <div className="mt-4">
          <h3 className="font-bold">Transfers Received:</h3>
          {transfersReceived.map((t, i) => (
            <p key={i}>You received {t.amount} coin(s) from {t.name}.</p>
          ))}
        </div>
      ) : (
        <p className="mt-4">You did not receive any direct transfers this round.</p>
      )}

      <Scoreboard />
      <Button handleClick={() => player.stage.set("submit", true)}>
        Play Again
      </Button>
    </div>
  );
}
