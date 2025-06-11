import React from "react";
import { Button } from "../components/Button";

export function Introduction({ next }) {
  return (
    <div className="mt-3 sm:mt-5 p-20">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Instruction One
      </h3>
      <div className="mt-2 mb-6">
        <p>
          You are now part of a group of <strong> 3 participants</strong>. Each of you has been given <strong> 10 tokens</strong>.
          <br />
          Each round you will decide how many of your tokens to <strong>keep for yourself</strong> and how many to 
          <strong> contribute to a shared pool</strong>.
        </p>
        <p>
          * Tokens you keep stay in your personal account.
          <br />
          * Tokens contributed to the shared pool will be <strong>multiplied by 2 </strong>
          and then <strong>divided equally</strong> among all players, regardless of how much each person contributed.
        </p>
        <p>
          For example, if the group contributes a total of 8 tokens to the common pool:
          <br />
          6 tokens x 2 = 12 tokens
          <br />
          12 ÷ 3 = 4 tokens
          <br />
          Each player earns <strong> 4 tokens from the pool</strong>, plus any tokens they kept for themselves.
        </p>
        <p><strong>Your goal is to earn as many tokens as possible.</strong></p>
      </div>
      <Button handleClick={next} autoFocus>
        <p>Next</p>
      </Button>
    </div>
  );
}
