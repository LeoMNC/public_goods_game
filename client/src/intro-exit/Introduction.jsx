import React from "react";
import { usePlayers } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";

export function Introduction({ next }) {
  const players = usePlayers();
  const playerCount = players.length || 1; // default to 1 just in case

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
          For example, if the group contributes a total of 6 tokens to the common pool:
          <br />
          6 tokens × 2 = 12 tokens
          <br />
          12 ÷ {playerCount} = {(12 / playerCount).toFixed(2)} tokens
          <br />
          Each player earns <strong>{(12 / playerCount).toFixed(2)} tokens from the pool</strong>, plus any tokens they kept for themselves.
        </p>
        <p><strong>Your goal is to earn as many tokens as possible.</strong></p>
      </div>
      <Button handleClick={next} autoFocus>
        <p>Next</p>
      </Button>
    </div>
  );
}
