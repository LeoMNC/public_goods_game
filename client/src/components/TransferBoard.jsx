// client/src/components/TransferBoard.jsx
import React, { useState, useEffect } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";

export function TransferBoard() {
  const players = usePlayers() || [];
  const currentPlayer = usePlayer();
  const [transfers, setTransfers] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize transfers state with 0 for each player
    const initialTransfers = players.reduce((acc, player) => {
      if (player.id !== currentPlayer.id) {
        acc[player.id] = 0; // Default transfer value is 0
      }
      return acc;
    }, {});
    setTransfers(initialTransfers);
  }, [players, currentPlayer]);

  if (!currentPlayer) {
    return <div>Loading...</div>;
  }

  const handleTransferChange = (playerId, amount) => {
    if (amount < 0 || amount > 5 || isNaN(amount)) return; // Ensure transfer is between 0 and 5
    setTransfers((prev) => ({ ...prev, [playerId]: amount }));
  };

  const totalTransfer = Object.values(transfers).reduce((sum, val) => sum + (val || 0), 0);
  const playerCoins = currentPlayer.get("coins") || 0;

  const handleTransferClick = () => {
    if (totalTransfer > playerCoins) {
      setError("Insufficient coins");
      return;
    }

    // Create a list of transfer pairs where amount > 0
    const transfersList = Object.entries(transfers)
      .filter(([_, amount]) => amount > 0)
      .map(([playerId, amount]) => ({
        recipient: playerId,
        amount: Number(amount)
      }));

    // Save the transfers list to player's round data
    currentPlayer.round.set("transfers", transfersList);

    // Process the transfers
    transfersList.forEach(({ recipient, amount }) => {
      const player = players.find((p) => p.id === recipient);
      if (player) {
        // Update recipient's received transfers
        const currentReceived = player.round.get("receivedTransfers") || [];
        player.round.set("receivedTransfers", [
          ...currentReceived,
          { from: currentPlayer.id, amount }
        ]);
        
        // Update recipient's coins
        const recipientCoins = player.get("coins") || 0;
        player.set("coins", recipientCoins + amount);
      }
    });

    // Deduct the total amount transferred
    currentPlayer.set("coins", playerCoins - totalTransfer);

    // Mark the stage as submitted
    currentPlayer.stage.set("submit", true);
    setTransfers({});
    setError(null);
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold">Transfer Coins</h2>
      <ul className="list-disc pl-5">
        {players
          .filter((p) => p.id !== currentPlayer?.id)
          .map((player) => (
            <li key={player.id} className="flex items-center gap-2">
              <label htmlFor={`transfer-${player.id}`}>{player.get("name")}</label>
              <input
                type="number"
                id={`transfer-${player.id}`}
                min="0"
                max="5"
                value={transfers[player.id] || 0}
                onChange={(e) => handleTransferChange(player.id, Number(e.target.value))}
                className="w-16 border rounded px-2"
              />
            </li>
          ))}
      </ul>
      <p className="mt-2">Transfer Total: {totalTransfer} coins</p>
      {error && <p className="text-red-600 font-bold">{error}</p>}
      <button
        onClick={handleTransferClick}
        disabled={totalTransfer > playerCoins}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Transfer
      </button>
    </div>
  );
}