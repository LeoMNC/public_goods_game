import React, { useState, useEffect } from "react";
import { Slider, usePlayer, useStage } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button.jsx";

export function Contribution() {
  const player = usePlayer();
  const stage = useStage();
  const currentTokens = player.get("tokens") || 10; // Ensure tokens is set at the player level

  const [contribution, setContribution] = useState(player.round.get("contribution") || 0);

  function handleSubmit() {
    // write your state value out
    player.round.set("contribution", contribution);
    player.stage.set("submit", true);

    const name = player.get("name") || "Player Unknown";
    // use the outer `contribution` state directly
    console.log(`${name} contributed ${contribution} tokens.`);
  }

  return (
    <div className="text-center mt-3 sm:mt-5 p-20">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-blue-800 mb-2">How Contribution Works</h3>
        <ul className="list-disc list-inside text-left mx-auto max-w-md mt-4">
          <li>Contribute any number of your tokens to the shared pool.</li>
          <li>The pool is multiplied by <strong>2</strong>.</li>
          <li>It's split evenly among all players.</li>
          <li>You keep any tokens you don't contribute.</li>
        </ul>
        <p className="mt-4">
          <strong>Remember:</strong> You can only contribute <strong>once per round</strong>.
          <p>If you choose to contribute <strong>all</strong> your tokens now, 
          you won’t have any left for other actions this round 
          (like <em>monitoring</em>, <em>punishing</em>, or <em>transferring</em>).</p>
        </p>

        {!player.stage.submitted && (
          <>
            <div className="mt-6">
              <h1 className="text-lg font-bold mb-2">How many tokens will you contribute?</h1>
              <input
                type="range"
                min="0"
                max={currentTokens}
                step="1"
                value={contribution}
                onChange={(e) => setContribution(parseInt(e.target.value))}
              />
              <p className="mt-2">Selected: <strong>{contribution}</strong></p>
            </div>

            <div className="mt-4">
              <Button handleClick={handleSubmit} primary>
                Submit
              </Button>
            </div>
          </>
        )}

        {player.stage.submitted && (
          <div className="mt-6 text-gray-600">
            <h3 className="text-lg font-semibold">Waiting on other players...</h3>
            <p className="text-sm">Please wait until all players have submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
}