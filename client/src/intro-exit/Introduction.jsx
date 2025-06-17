// client/src/intro-exit/Introduction.jsx
import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";

export function Introduction({ next }) {
  const player = usePlayer();
  if (!player) return <div>Loading players...</div>;
  const playerCount = player.currentGroup?.players?.length ?? 1;

  const exampleContribution = 10;
  const totalContribution = exampleContribution * playerCount;
  const multipliedPool = totalContribution * 2;
  const individualShare = (multipliedPool / playerCount).toFixed(2);

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Instruction One
      </h3>
      <div className="mt-2 mb-6">
        <p>
          You are now part of a group of <strong>{playerCount} participants</strong>. Each of you has been given <strong>10 tokens</strong>.
          <br />
          Each round you will decide how many of your tokens to <strong>keep for yourself</strong> and how many to <strong>contribute to a shared pool</strong>.
        </p>
        <p>
          * Tokens you keep stay in your personal account.
          <br />
          * Tokens contributed to the shared pool will be <strong>multiplied by 2</strong> and then <strong>divided equally</strong> among all {playerCount} participants, regardless of how much each person contributed.
        </p>
        <p>
          For example, if each player contributes {exampleContribution} tokens:
          <br />
          {exampleContribution} tokens × {playerCount} = {totalContribution} tokens
          <br />
          {totalContribution} ÷ {playerCount} = {individualShare} tokens
          <br />
          Each player earns <strong>{individualShare} tokens from the pool</strong>, plus any tokens they kept for themselves.
        </p>
        <p><strong>Your goal is to earn as many tokens as possible.</strong></p>
      </div>
      <Button handleClick={next} autoFocus>
        <p>Next</p>
      </Button>
    </div>
  );
}
