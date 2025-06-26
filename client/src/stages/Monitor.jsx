// client/src/stages/Monitor.jsx
import React, { useState, useEffect, useCallback } from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import { Button } from "../components/Button";

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
    console.log("Submitting monitor selection:", { selectedPlayers, cost });
    //console.log(`Current tokens for player ${player.get("name")}: ${currentTokens}`);
    // Save to round store
    player.round.set("monitoredPlayers", selectedPlayers);
    player.round.set("monitoringCost", cost);
    // Advance stage
    player.stage.set("submit", true);
    console.log()
    // Clear for next round
    setSelectedPlayers([]);
  }, [player, selectedPlayers, cost]);

  const otherPlayers = players.filter((p) => p.id !== player.id);

  return (
    <div className="text-center mt-3 sm:mt-5 p-20">
      <h2 className="text-2xl font-bold">
        You have {currentTokens} token{currentTokens !== 1 && "s"}
      </h2>

      <Scoreboard />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          How Monitoring Works
        </h3>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            {/* eye icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <p className="text-left">
            You can pay <span className="font-bold">1 token per player</span> to
            monitor them. For each you select, you’ll see their last‐round contribution
            at the start of the next round.
          </p>
        </div>
      </div>

      {!player.stage.submitted ? (
        <>
          <div className="mt-6">
            <h1 className="text-xl font-bold mb-2">Select players to monitor</h1>
            <p className="text-gray-600 mb-4">
              Each player costs 1 token to monitor. You can select any number
              (including zero).
            </p>
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
              Cost: {cost} {cost === 1 ? "token" : "tokens"}
            </p>
            {disabled && (
              <p className="text-red-500 text-sm mt-1">
                Not enough tokens for this selection.
              </p>
            )}
          </div>

          <div className="mt-4">
            {/* pass handleClick, not onClick */}
            <Button
              primary
              handleClick={handleSubmit}
              disabled={disabled}
            >
              Submit
            </Button>
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
