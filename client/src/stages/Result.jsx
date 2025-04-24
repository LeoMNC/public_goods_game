import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";
import { Scoreboard } from "../components/Scoreboard";

export function Result() {
  const player = usePlayer();
  const players = usePlayers();

  const totalDonatedCoins = players.reduce((sum, p) => sum + (p.round.get("donation") || 0), 0);
  const share = player.round.get("share");
  const numPunishments = player.round.get("punishment");

  // Calculate donations received by this player
  const donationsReceived = players
    .map((p) => ({ donor: p.get("name"), amount: p.round.get("donationTo")?.[player.id] || 0 }))
    .filter((donation) => donation.amount > 0);

  // Update player's coins with received donations
  const totalReceived = donationsReceived.reduce((sum, donation) => sum + donation.amount, 0);
  player.set("coins", (player.get("coins") || 0) + totalReceived);

  return (
    <div>
      <p>{`You donated: ${player.round.get("donation")}`}</p>
      <p>{`The pool donated: ${totalDonatedCoins}`}</p>
      <p>{`You receive: ${share} coins!`}</p>
      <p>{`You were punished: ${numPunishments} times, resulting in a loss of ${numPunishments * 5} coins!`}</p>
      
      {donationsReceived.length > 0 && (
        <div>
          <h3>Donations Received:</h3>
          {donationsReceived.map((donation, index) => (
            <p key={index}>{`You received a donation of ${donation.amount} coins from ${donation.donor}.`}</p>
          ))}
        </div>
      )}
      
      <Scoreboard />
      <Button handleClick={() => player.stage.set("submit", true)}>
        Play Again
      </Button>
    </div>
  );
}
