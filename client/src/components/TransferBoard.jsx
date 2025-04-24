import React, { useState, useEffect } from "react";
import { usePlayers, usePlayer } from "@empirica/core/player/classic/react";

export function TransferBoard() {
  const players = usePlayers() || [];
  const currentPlayer = usePlayer();
  const [transfers, setTransfers] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (players.length > 0) {
      console.log("All players:", players);
    }
  }, [players]);

  if (!currentPlayer) {
    return <div>Loading...</div>;
  }

  const handleTransferChange = (playerId, amount) => {
    if (amount < 0 || amount > 5 || isNaN(amount)) return;
    setTransfers((prev) => ({ ...prev, [playerId]: amount }));
  };

  const totalTransfer = Object.values(transfers).reduce((sum, val) => sum + (val || 0), 0);
  const playerCoins = currentPlayer.get("coins") || 0;

  const handleTransferClick = () => {
    if (totalTransfer > playerCoins) {
      setError("Insufficient coins");
      return;
    }

    const updatedTransfers = Object.entries(transfers).filter(([_, amount]) => amount > 0);
    if (updatedTransfers.length === 0) return;

    updatedTransfers.forEach(([playerId, amount]) => {
      const player = players.find((p) => p.id === playerId);
      if (player) {
        player.set("coins", (player.get("coins") || 0) + amount);
      }
    });
    
    currentPlayer.set("coins", playerCoins - totalTransfer);
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
                value={transfers[player.id] || ""}
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
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Transfer
      </button>
    </div>
  );
}