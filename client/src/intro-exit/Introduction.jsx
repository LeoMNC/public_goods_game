// client/src/intro-exit/Introduction.jsx
import React from "react";
import { usePlayer, usePlayers, useGame } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";
import stagesImg from "../stages/Stages.png";

export function Introduction({ next }) {
  const player = usePlayer();
  if (!player) return <div>Loading players...</div>;

  const game = useGame();
  const { pCount } = game.get("treatment");
  console.log(`Player count: ${pCount}`);
  const playerCount = Number.isFinite(+pCount) ? +pCount : 1;

  const groupContribution = 5; // total contribution from the whole group
  const doubledPool = groupContribution * 2;
  const individualShare = (doubledPool / playerCount);

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Game Instructions</h2>

      <div className="text-gray-800 space-y-4">
        <p> 
          Welcome! You are now part of a group of {playerCount} players participating in the <strong>Games and Strategic Interaction</strong> study.
        </p>
        <p>
          Each round, every player starts with <strong>10 tokens</strong> and progresses through <strong>6 stages</strong>. This cycle repeats for <strong>5 rounds</strong>.
        </p>
        
        <p>In each round, you’ll decide how to use your tokens:</p>
          <ul className="list-disc ml-6 mt-1">
            <li><strong>Contribute</strong> them to a shared pool where the total is doubled and evenly distributed among all players, regardless of contribution.</li>
            <li><strong>Spend</strong> them on actions like monitoring, punishing, or rewarding your peers.</li>
            <li><strong>Save</strong> them in your personal account.</li>
          </ul>

        <div className="space-y-2 mt-6">
          <p>
            <strong>Example:</strong><br />
          </p>
          <p>
            Suppose you are a part of a group of <strong>4 players</strong>.
          </p>
          <p>
            If the group collectively contributes {groupContribution} tokens:
            <br />
            {groupContribution} × 2 = {doubledPool} tokens in the shared pool<br />
            {doubledPool} ÷ 4 = {individualShare} tokens per player<br />
            Each player receives <strong>{individualShare} tokens from the pool</strong> + any tokens they kept.
          </p>
        </div>
        <div className="my-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Overview</h3>
          <img
            src={stagesImg}
            alt="Game stages: Contribution, Monitoring, Intermission, Punishment, Transfers, Credits"
            className="w-full rounded-md shadow-md"
          />
        </div>
        <div className="space-y-2 mt-6">
          <h3 className="text-xl font-semibold text-gray-900">Round Structure</h3>
          <ol className="space-y-2 pl-4 border-l-2 border-gray-300">
            <li>
              <strong>Stage 1: Contribution</strong> – Choose how many tokens to contribute to the pool.
            </li>
            <li>
              <strong>Stage 2: Monitoring</strong> – Spend 1 token per player to see their contribution.
            </li>
            <li>
              <strong>Stage 3: Intermission</strong> – View results from monitoring and pool earnings.
            </li>
            <li>
              <strong>Stage 4: Punishment</strong> – Spend 1 token to punish a player. They lose 5 tokens.
            </li>
            <li>
              <strong>Stage 5: Transfers</strong> – Send tokens to reward another player.
            </li>
            <li>
              <strong>Stage 6: Credits</strong> – Review your round summary: contributions, gains, losses.
            </li>
          </ol>
          
          <p className="text-base text-gray-900 mt-4">
            <strong>Note:</strong> All players must complete each stage before moving on. After Stage 6, the round ends and everyone starts the next round with <strong>10 fresh tokens</strong>. This cycle repeats until all 5 rounds are complete, after which the game ends.
          </p>
        </div>

        <p className="font-semibold text-lg text-red-700">
          Remember: Your goal is to earn as many tokens as possible.
        </p>
      </div>

      <div className="flex justify-end pt-6">
        <Button handleClick={next} autoFocus>
          <p>Next</p>
        </Button>
      </div>
    </div>
  );
}