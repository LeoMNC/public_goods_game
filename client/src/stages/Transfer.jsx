// client/src/stages/Transfer.jsx
import React, { useState, useEffect, useRef } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import stage5Img from "../stages/Stage5Transfers.png";



export function Transfer() {
  const {
    player,
    players,
    transfers,
    totalTransfer,
    playerTokens,
    error,
    handleTransferChange,
    handleSubmit,
  } = useTransfer();
  if (!player) return <div className="p-6 text-center">Loading…</div>;
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
      <form onSubmit={handleSubmit}>
        <div className="mt-6">
          <h1 className="text-lg font-bold mb-2">Which players would you like to transfer tokens to?</h1>
          <TransferList
            player={player}
            players={players}
            transfers={transfers}
            onChange={handleTransferChange}
          />
          <div className="mt-6 bg-gray-50 p-4 rounded-lg inline-block">
            <p className="font-medium">
              <strong>Transfer Total:</strong> {totalTransfer} tokens
            </p>
            {error && <p className="text-red-600 font-bold">{error}</p>}
            <button
              type="submit"
              disabled={totalTransfer > playerTokens}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Transfer
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function useTransfer() {
  const player = usePlayer();
  const players = usePlayers() || [];
  const [transfers, setTransfers] = useState({});
  const [error, setError] = useState(null);
  const didInit = useRef(false);

  // Initialize zero‐transfers for all other players
  useEffect(() => {
    if (didInit.current || !player) return;
    const initialTransfers = players.reduce((acc, p) => {
      if (player.id !== p.id) {
        acc[p.id] = 0;
      }
      return acc;
    }, {});
    setTransfers(initialTransfers);
    didInit.current = true;
  }, [players, player]);

  const handleTransferChange = (playerId, amount) => {
    if (amount === "") {
      setTransfers((prev) => ({ ...prev, [playerId]: 0 }));
      return;
    }
    if (amount < 0 || amount > 5 || isNaN(amount)) return;
    const clamped = Math.floor(Math.max(0, Math.min(5, amount)))
    setTransfers((prev) => ({ ...prev, [playerId]: clamped }));
  };

  const totalTransfer = Object.values(transfers).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const playerTokens = player?.get("tokens") || 0;
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!player) return;
    if (totalTransfer > playerTokens) {
      setError("Insufficient tokens");
      return;
    }
    player.round.set("transfersSent", totalTransfer);
    Object.entries(transfers)
      .filter(([_, amount]) => amount > 0)
      .forEach(([recipientId, amount]) => {
        const recipient = players.find((p) => p.id === recipientId);
        if (recipient) {
          const prevReceived = recipient.round.get("transfersReceived") || 0;
          recipient.round.set("transfersReceived", prevReceived + Number(amount));
        }
      });
    player.stage.set("submit", true);
    // setTransfers({});
    setError(null);
  };
  return {
    player,
    players,
    transfers,
    handleTransferChange,
    totalTransfer,
    playerTokens,
    error,
    handleSubmit
  };
}

function TransferList({ player, players, transfers, onChange }) {
  return (
    <ul className="flex flex-col space-y-2 max-w-md mx-auto">
      {players
        .filter((p) => p.id !== player?.id)
        .map((p) => (
          <li key={p.id} className="flex items-center gap-2">
            <label htmlFor={`transfer-${p.id}`} className='w-32 text-left'>
              {p.get("name")}
            </label>
            <input
              type="number"
              id={`transfer-${p.id}`}
              min="0"
              max="5"
              value={transfers[p.id] || 0}
              onChange={(e) =>
                onChange(
                  p.id,
                  Number(e.target.value)
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault();}
              }}
              className="w-16 border rounded px-2"
            />
          </li>
        ))
      }
    </ul>
    );
  }
