// client/src/stages/Transfer.jsx
import React, { useState, useEffect } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import stage5Img from "../stages/Stage5Transfers.png";


export function Transfer() {
  const players = usePlayers() || [];
  const currentPlayer = usePlayer();
  const [transfers, setTransfers] = useState({});
  const [error, setError] = useState(null);

  // Initialize zero‐transfers for all other players
  useEffect(() => {
    if (!currentPlayer) return;

    const initialTransfers = players.reduce((acc, player) => {
      if (player.id !== currentPlayer.id) {
        acc[player.id] = 0;
      }
      return acc;
    }, {});
    setTransfers(initialTransfers);
  }, [players, currentPlayer]);

  if (!currentPlayer) {
    return <div>Loading...</div>;
  }

  // Only allow 0–5 tokens per recipient
  const handleTransferChange = (playerId, amount) => {
    if (amount < 0 || amount > 5 || isNaN(amount)) return;
    setTransfers((prev) => ({ ...prev, [playerId]: amount }));
  };

  // Sum of all specified transfers
  const totalTransfer = Object.values(transfers).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const playerTokens = currentPlayer.get("tokens") || 0;

  const handleTransferClick = () => {
    if (totalTransfer > playerTokens) {
      setError("Insufficient tokens");
      return;
    }

    // 1) Record how much this player sent
    currentPlayer.round.set("transfersSent", totalTransfer);

    // 2) Update each recipient's received total
    Object.entries(transfers)
      .filter(([_, amount]) => amount > 0)
      .forEach(([recipient, amount]) => {
        const recPlayer = players.find((p) => p.id === recipient);
        if (recPlayer) {
          const prevReceived =
            recPlayer.round.get("transfersReceived") || 0;
          recPlayer.round.set(
            "transfersReceived",
            prevReceived + Number(amount)
          );
        }
      });

    // Advance to next stage
    currentPlayer.stage.set("submit", true);

    // Reset local state
    setTransfers({});
    setError(null);
  };

  return (
    <div className="text-center mt-3 sm:mt-5 p-20">

      <Scoreboard />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-blue-800 mb-2">How Transferring Works</h3>
        <p><strong>Each token you transfer</strong> costs <strong>1 token</strong> from your total.</p>
        <p>You can send <strong>up to 5 tokens</strong> to each player.</p>
        <p><strong>Remember:</strong> You can only transfer <strong>once per round</strong>, 
          but you're free to select <strong>as many players</strong> as you like 
          (as long as you can afford the cost).
        </p>
      </div>
      
      <div className="mt-6">
        <h1 className="text-lg font-bold mb-2">Which players would you like to transfer tokens to?</h1>
        <div className="flex flex-col space-y-2 max-w-md mx-auto">
          {players
            .filter((p) => p.id !== currentPlayer?.id)
            .map((player) => (
              <li key={player.id} className="flex items-center gap-2">
                <label htmlFor={`transfer-${player.id}`}>
                  {player.get("name")}
                </label>
                <input
                  type="number"
                  id={`transfer-${player.id}`}
                  min="0"
                  max="5"
                  value={transfers[player.id] || 0}
                  onChange={(e) =>
                    handleTransferChange(
                      player.id,
                      Number(e.target.value)
                    )
                  }
                  className="w-16 border rounded px-2"
                />
              </li>
            ))
          }
              <div className="mt-6 bg-gray-50 p-4 rounded-lg inline-block">
                <p className="font-medium">
                  <strong>Transfer Total:</strong> {totalTransfer} tokens
                </p>
                {error && <p className="text-red-600 font-bold">{error}</p>}
                <button
                  onClick={handleTransferClick}
                  disabled={totalTransfer > playerTokens}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Transfer
                </button>
              </div>
          </div>
        </div>
      </div>
  );
}
