import React, { useState, useEffect } from "react";
import { Slider, usePlayer, useStage } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button.jsx";

export function Contribution() {
  const player = usePlayer();
  const stage = useStage();
  const currentCoins = player.get("coins") || 10; // Ensure coins is set at the player level

  const [contribution, setContribution] = useState(player.round.get("contribution") || 0);

  function handleSubmit() {
    player.round.set("contribution", contribution);
    player.stage.set("submit", true);
  }

  const isResultStage = stage.get("name") === "Result";
  console.log(`Player: ${player.name}, Contribution Level: ${player.round.get("contribution")}`);
  return (
    <div className="text-center">
      <h2>You have {currentCoins} coins.</h2>
      <p>You can contribute any number of your coins to a shared pool.</p>
      <ul className="list-disc list-inside text-left mx-auto max-w-md mt-4">
        <li>The pool is multiplied by <strong>2</strong>.</li>
        <li>It's split evenly among all players.</li>
        <li>You keep any coins you don't contribute.</li>
      </ul>

      {!isResultStage && !player.stage.submitted && (
        <>
          <div className="mt-6">
            <label className="block mb-2">How many coins will you contribute?</label>
            <input
              type="range"
              min="0"
              max={currentCoins}
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
  );
}
