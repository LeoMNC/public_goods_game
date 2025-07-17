// client/src/intro-exit/Introduction.jsx
import React from "react";
import { usePlayer, useGame } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";
import stagesImg from "../stages/RoundStructure.png";
import { useEffect } from "react";

export function Introduction({ next }) {
  const player = usePlayer();
  useEffect(() => {
    window.scrollTo(0, 0);
   }, []);

  if (!player) return <div>Loading players...</div>;

  const game = useGame();
  const treatment = game.get("treatment") || {};
  console.log("treatment: ", treatment);

  const pCount = treatment.playerCount;
  console.log(`Player count: ${pCount}`);
  const playerCount = pCount || 1;
  const examplePlayerCount = playerCount || 4; // Example for illustration purposes
  const groupContribution = 12; // total contribution from the whole group
  const CONTRIBUTION_MULTIPLIER = 2; // the pool is doubled
  const doubledPool = groupContribution * CONTRIBUTION_MULTIPLIER; // total in the shared pool
  const individualShare = (doubledPool / examplePlayerCount);

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Game Instructions</h2>

      <div className="text-gray-800 space-y-4">
        <p> 
          Welcome! You are now part of a group of {playerCount} players participating in the <strong>Games and Strategic Interaction</strong> study.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm space-y-2">
          <p>
          This game runs for <b>5 rounds</b>, each of which has <b>6 stages</b>. In each round, every player starts with <strong>10 tokens</strong> and can spend them in various ways during the different stages.
          At the end of each round, you may gain or lose tokens based on your actions and those of other players. Whatever is left over will be converted into points and you will receive a summary of your performance.
          At the end of the game, you can spend your points on prizes like stickers, candy, or extra Sona credits. <strong>Try to get as many points as possible to maximize your rewards!</strong>
          </p>
        </div>
        
        <p>In each round, you’ll decide how to use your tokens:</p>
          <ul className="list-disc ml-6 mt-1">
            <li><strong>Contribute</strong> them to a shared pool where the total is doubled and evenly distributed among all players, regardless of contribution.</li>
            <li><strong>Spend</strong> them on actions like monitoring, punishing, or rewarding your peers.</li>
            <li><strong>Save</strong> them in your personal account.</li>
          </ul>

        <div className="my-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Overview</h3>
          <img
            src={stagesImg}
            alt="Game stages: Contribution, Monitoring, Intermission, Punishment, Transfers, Credits"
            className="w-full max-w-5xl mx-auto rounded-md shadow-md"
          />
        </div>
        <div className="space-y-2 mt-6">
          <p className="text-base text-gray-900 mt-4">
            <strong>Note:</strong> All players must complete each stage before moving on. <strong>After Stage 6</strong>, the round ends and everyone starts the next round with <strong>10 fresh tokens</strong>. This cycle repeats until all <strong>5 rounds</strong> are complete, after which the game ends.
          </p>
        </div>

        <p className="font-semibold text-lg text-red-700">
          Remember: Your goal is to earn as many points as possible over the course of the game.
        </p>
      </div>

      <div className="flex justify-end pt-6">
        <Button handleClick={next}>
          <p>Next</p>
        </Button>
      </div>
    </div>
  );
}