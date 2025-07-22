// client/src/stages/Monitor.jsx
import React, { useState, useEffect, useCallback } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";

export function Monitor() {
  const player = usePlayer();
  const players = usePlayers() || [];
  const currentTokens = player.get("tokens") || 0;

  // Load previously‑selected players (or empty)
  const [selectedPlayers, setSelectedPlayers] = useState(
    player.round.get("monitoredPlayers") || []
  );
  
  // Whenever the player object or list changes, re‑init selection
  useEffect(() => {
    if (!player) return;
    setSelectedPlayers(player.round.get("monitoredPlayers") || []);
  }, [player, players]);

  // 1 token per monitored player
  const cost = selectedPlayers.length;
  const disabled = cost > currentTokens;

  const handlePlayerToggle = useCallback(
    (id) =>
      setSelectedPlayers((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      ),
    []
  );

const handleSubmit = useCallback(() => {
  if (cost > currentTokens) {
    console.log(`Player ${player.id} tried to monitor with insufficient tokens`);
    return;
  }
  
  console.log("Submitting monitor selection:", { selectedPlayers, cost });
  
  // Set both the list of monitored players AND the cost
  player.round.set("monitoredPlayers", selectedPlayers);
  player.round.set("monitoringCost", cost);  // Explicitly set the cost
  
  // Deduct tokens immediately
  player.set("tokens", currentTokens - cost);
  
  player.stage.set("submit", true);
  setSelectedPlayers([]);
}, [player, selectedPlayers, cost, currentTokens]);

  const otherPlayers = players.filter((p) => p.id !== player.id);

  return (
    <div className="text-center mt-3 sm:mt-5 p-20">

      <Scoreboard />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-blue-800 mb-2">How Monitoring Works</h3>
        <p>Spend <strong>1 token per player</strong> to reveal how much they contributed this round.</p>
        <p>Use this intel to reward team players — or punish free-riders.</p>
        <p>
          <strong>Remember:</strong> You can only monitor <strong>once per round</strong>, 
          but you're free to select <strong>as many players</strong> as you like 
          (as long as you can afford the cost).
        </p>
      </div>

      {!player.stage.submitted ? (
        <>
          <div className="mt-6">
            <h1 className="text-lg font-bold mb-2">Which players would you like to monitor?</h1>
            <div className="flex flex-col space-y-2 max-w-md mx-auto">
              {otherPlayers.map((p) => {
                const inputId = `player-${p.id}`;
                return (
                  <div key={p.id} className="relative">
                    <input
                      type="checkbox"
                      id={inputId}
                      name="monitoredPlayers"
                      value={p.id}
                      checked={selectedPlayers.includes(p.id)}
                      onChange={() => handlePlayerToggle(p.id)}
                      className="absolute opacity-0 w-0 h-0"
                    />
                    <label
                      htmlFor={inputId}
                      className={`block p-3 border rounded cursor-pointer transition-colors ${
                        selectedPlayers.includes(p.id)
                          ? "bg-blue-100 border-blue-500"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{p.get("name") || `Player ${p.id}`}</span>
                        {selectedPlayers.includes(p.id) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg inline-block">
            <p className="font-medium">
              <strong>Cost:</strong> {cost} {cost === 1 ? "token" : "tokens"}
            </p>
            {disabled && (
              <p className="text-red-500 text-sm mt-1">
                Not enough tokens for this selection.
              </p>
            )}
          </div>

          <div className="mt-4">
            {/* pass handleClick, not onClick */}
            <button
            onClick={handleSubmit}
            disabled={disabled}
            className={`mt-6 px-5 py-2 rounded-xl text-white transition ${
              disabled 
                ? "bg-blue-300 cursor-not-allowed opacity-50" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Submit
          </button>
          </div>
        </>
      ) : (
        <div className="mt-6 text-gray-600">
          <h3 className="text-lg font-semibold">Waiting on other players...</h3>
          <p className="text-sm">Please wait until all players have submitted.</p>
        </div>
      )}
    </div>
  );
}
