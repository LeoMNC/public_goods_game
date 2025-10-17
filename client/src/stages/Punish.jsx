// client/src/stages/Punish.jsx
import React, { useState, useCallback } from "react";
import { usePlayers, usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import stage4Img from "../stages/Stage4Punishment.png";


// Client‐side multiplier must match server
const punishMultiplier = 5;

export function Punish() {
  const {
    player,
    players,
    punishedIds,
    cost,
    tokens,
    error,
    disabled,
    togglePunish,
    handleSubmit,
  } = usePunish();

  return (
    <div className="text-center mt-3 sm:mt-5 p-20">
      
      <Scoreboard />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 max-w-2xl mx-auto"> {/* blue box */}
        <h3 className="text-xl font-bold text-blue-800 mb-2">
          How Punishing Works
        </h3>
        <ul className="list-disc list-inside text-left mx-auto max-w-md mt-4">
          <li>You lose <strong>1 token</strong> for each player you punish.</li>
          <li>Each punished player loses <strong>5 tokens</strong> at the end of the round.</li>
        </ul>
        <p className="mt-4">
          <strong>Remember:</strong> You can only punish <strong>once per round</strong>,
          but you're free to select <strong>as many players</strong> as you like 
          (as long as you can afford the cost).
        </p>
        <form onSubmit={handleSubmit}>
          <h1 className="text-lg font-bold mb-2">Which players would you like to punish?</h1>
          <PunishList
            player={player}
            players={players}
            punishedIds={punishedIds}
            togglePunish={togglePunish}
            currentPlayerId={player.id}
          />

          <div className="mt-4">
            <p>
              <strong>Cost:</strong> {cost} token{cost !== 1 && "s"}
            </p>
            {error && <p className="text-red-600 font-bold mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="mt-6 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Punishment
          </button>
        </form>
      </div>
    </div>
  );
}

function usePunish() {
  const player = usePlayer();
  const players = usePlayers() || [];
  const [punishedIds, setPunishedIds] = useState([]);
  const [error, setError] = useState(null);

  if (!player) {
    return <div className="p-6 text-center">Loading…</div>;
  }

  const cost = punishedIds.length;
  const tokens = player.get("tokens") || 0;
  const disabled = cost > tokens;
  const penaltyMap = Object.fromEntries(
    punishedIds.map((id) => [id, 1])
  );
  
  const togglePunish = useCallback((playerId) => {
    setError(null);
    setPunishedIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  }, []);

  
  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!player) return;
    if (tokens < cost) {
      setError(`Not enough tokens. You have ${tokensAvailable}, need ${cost}.`);
      return;
    }

    player.round.set("givenPunishments", punishedIds);
    player.round.set("punishCost", cost);
    player.round.set("penaltyMap", penaltyMap);
    player.stage.set("submit", true);

    setPunishedIds([]);
    setError(null);
  },[player, punishedIds, cost, tokens, penaltyMap]);
  return {
    player,
    players,
    punishedIds,
    cost,
    tokens,
    error,
    disabled,
    togglePunish,
    handleSubmit
  };
}

function PunishList({ player, players, punishedIds, togglePunish }) {
  return (
    <ul className="space-y-2">
      {players
        .filter((p) => p.id !== player.id)
        .map((p) => (
          <li key={p.id} className="flex items-center">
            <input
              type="checkbox"
              id={`punish-${p.id}`}
              checked={punishedIds.includes(p.id)}
              onChange={() => togglePunish(p.id)}
              className="mr-3"
            />
            <label htmlFor={`punish-${p.id}`}> 
              {p.get("name")} 
            </label>
          </li>
        ))}
    </ul>
  );
}