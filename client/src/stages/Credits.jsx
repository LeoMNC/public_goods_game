// pages/RoundRecap.jsx
import React, { useEffect, useState } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";

export function RoundRecap() {
  const player = usePlayer();
  const players = usePlayers();

  const [coinsSpentOnPunishing, setCoinsSpentOnPunishing] = useState(0);
  const [coinsSpentOnTransferring, setCoinsSpentOnTransferring] = useState(0);
  const [punished, setPunished] = useState(false);
  const [points, setPoints] = useState(player.get("points") || 0); // Accumulated points

  useEffect(() => {
    // Update spent coins and punishment status when the player data changes
    const transferSpent = player.round.get("transferSpent") || 0;
    const punishSpent = player.round.get("punishSpent") || 0;

    setCoinsSpentOnTransferring(transferSpent);
    setCoinsSpentOnPunishing(punishSpent);

    // Check if the player has been punished (e.g., a deduction in coins)
    setPunished(player.get("punished") || false);

    // Convert coins to points: Assuming 1 coin = 1 point for simplicity
    const totalCoinsSpent = transferSpent + punishSpent;
    const newPoints = totalCoinsSpent + player.get("coins"); // Add remaining coins
    setPoints(newPoints);

    // Update the player's points
    player.set("points", newPoints);
  }, [player]);

  return (
    <div className="max-w-4xl mx-auto mt-6 p-8 bg-gray-50 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-empirica-700">Round Recap</h1>
      <div className="space-y-4 text-lg text-gray-800 mb-10">
        <p>
          During the round, you spent <strong>{coinsSpentOnTransferring}</strong> coins on transferring and <strong>{coinsSpentOnPunishing}</strong> coins on punishing other players.
        </p>
        {punished ? (
          <p className="text-red-500">
            You were punished and <strong>{coinsSpentOnPunishing}</strong> coins were deducted from your balance.
          </p>
        ) : (
          <p className="text-green-500">You were not punished this round.</p>
        )}
        <p>
          In total, <strong>{coinsSpentOnTransferring + coinsSpentOnPunishing}</strong> coins were spent this round.
        </p>
        <p>
          These coins are now being converted into points and will no longer exist. Your new total of points is: <strong>{points}</strong>.
        </p>
        <p>
          You now have <strong>{player.get("coins")}</strong> coins, which will also convert into points at the end of the game.
        </p>
        <div className="mt-6">
          <h3 className="text-2xl font-semibold text-empirica-700">Coin Transfers:</h3>
          {players.map((p) => {
            const transferAmount = p.round.get("transferSpent") || 0;
            if (transferAmount > 0) {
              return (
                <p key={p.id}>
                  <strong>{p.get("name")}</strong> transferred <strong>{transferAmount}</strong> coins.
                </p>
              );
            }
            return null;
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => player.stage.set("submit", true)}
          className="px-8 py-3 bg-empirica-600 text-white text-lg rounded-xl shadow-lg hover:bg-empirica-700 transition"
        >
          Done Reviewing Results - Finish Round
        </button>
      </div>
    </div>
  );
}
