// client/src/stages/Transfer.jsx
import React, { useState, useEffect } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";

export function Transfer() {
  const players = usePlayers() || [];
  const currentPlayer = usePlayer();
  const [transfers, setTransfers] = useState({});
  const [error, setError] = useState(null);

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

  const handleTransferChange = (playerId, amount) => {
    if (amount < 0 || amount > 5 || isNaN(amount)) return;
    setTransfers((prev) => ({ ...prev, [playerId]: amount }));
  };

  const totalTransfer = Object.values(transfers).reduce((sum, val) => sum + (val || 0), 0);
  const playerTokens = currentPlayer.get("tokens") || 0;

  const handleTransferClick = () => {
    if (totalTransfer > playerTokens) {
      setError("Insufficient tokens");
      return;
    }

    const transfersList = Object.entries(transfers)
      .filter(([_, amount]) => amount > 0)
      .map(([playerId, amount]) => ({ recipient: playerId, amount: Number(amount) }));

    currentPlayer.round.set("transfers", transfersList);

    transfersList.forEach(({ recipient, amount }) => {
      const player = players.find((p) => p.id === recipient);
      if (player) {
        const currentReceived = player.round.get("receivedTransfers") || [];
        player.round.set("receivedTransfers", [...currentReceived, { from: currentPlayer.id, amount }]);

        const recipientTokens = player.get("tokens") || 0;
      }
    });
    currentPlayer.stage.set("submit", true);
    setTransfers({});
    setError(null);
  };

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <p>
        <strong>4.1</strong> Transfer some tokens to another player. You can reward them for being nice!
      </p>

      <Scoreboard />

      <div className="flex w-sw justify-center">
        <div className="p-10">
          <h1 className="text-xl font-bold">To whom would you like to transfer tokens?</h1>
          <div className="p-4 border rounded">
            <h2 className="text-lg font-bold">Transfer Tokens</h2>
            <ul className="list-disc pl-5">
              {players.filter((p) => p.id !== currentPlayer?.id).map((player) => (
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
            <p className="mt-2">Transfer Total: {totalTransfer} tokens</p>
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
