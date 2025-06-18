import React, { useState } from "react";
import { usePlayer, useStage } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button.jsx";

export function Contribution() {
  const player = usePlayer();
  const stage = useStage();
  const currentTokens = player.get("tokens") || 10;

  const [contribution, setContribution] = useState(player.round.get("contribution") || 0);

  function handleSubmit() {
    player.round.set("contribution", contribution);
    player.stage.set("submit", true);
  }

  const isResultStage = stage.get("name") === "Result";

  return (
    <div className="max-w-xl mx-auto text-center px-6 py-8 space-y-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800">Contribute to the Pool</h2>

      <p className="text-gray-700">
        You have <strong>{currentTokens} tokens</strong> this round. You may contribute any number of them to a <strong>shared pool</strong>.
      </p>

      <ul className="text-left text-gray-600 list-disc list-inside space-y-1">
        <li>Contributions are <strong>doubled</strong> in the pool.</li>
        <li>The total is <strong>evenly distributed</strong> among all players.</li>
        <li>You keep any tokens you don’t contribute.</li>
      </ul>

      {!isResultStage && !player.stage.submitted && (
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              How many tokens will you contribute?
            </label>
            <input
              type="range"
              min="0"
              max={currentTokens}
              step="1"
              value={contribution}
              onChange={(e) => setContribution(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="mt-2 text-gray-800">
              Selected: <strong>{contribution}</strong> tokens
            </p>
          </div>

          <Button handleClick={handleSubmit} primary>
            Submit
          </Button>
        </div>
      )}

      {player.stage.submitted && (
        <div className="mt-6 text-gray-600">
          <h3 className="text-lg font-semibold">Waiting for others...</h3>
          <p className="text-sm">Once everyone submits, the round will continue.</p>
        </div>
      )}
    </div>
  );
}
