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
        Game Instructions
      </h3>
      <div className="mt-2 mb-6 space-y-4">
        <p>
          You are now part of a group of <strong>{playerCount} participants</strong>. Each round, every player starts with <strong>10 tokens</strong> and moves through <strong>6 stages</strong>. This cycle repeats for <strong>5 rounds</strong>.
        </p>
        <p>
          In each round, you decide how to use your tokens, whether to <strong>keep</strong> them, <strong>contribute</strong> them to a <strong>shared pool</strong>, or <strong>spend</strong> them on actions like <strong>monitoring</strong>, <strong>punishing</strong>, or <strong>rewarding others</strong>.
        </p>
        <p>
          Note that tokens you keep stay in your personal account. <br />
        </p>
        <p>
          Here’s how each round is structured:
          <br />
          <br />
          <strong>Stage 1: Contribution</strong> – Choose how many tokens to contribute to the shared pool. Tokens contributed to the pool are <strong>doubled</strong> and then <strong>evenly split</strong> among all {playerCount} players, regardless of how much each person contributed.
          <p>
          For example, if each player contributes {exampleContribution} tokens: <br />
          {exampleContribution} × {playerCount} = {totalContribution} tokens <br />
          {totalContribution} ÷ {playerCount} = {individualShare} tokens per player <br />
          So each player receives <strong>{individualShare} tokens from the pool</strong>, plus any tokens they kept.
        </p>
        <br />
          <strong>Stage 2: Monitoring</strong> – You may pay 1 token per player to see how many tokens they contributed.
          <br />
          <strong>Stage 3: Intermission</strong> – View how much you earned and what you learned from monitoring. No decisions are made here.
          <br />
          <strong>Stage 4: Punishment</strong> – Spend 1 token to punish another player. Each punishment removes 5 tokens from that player.
          <br />
          <strong>Stage 5: Transfers</strong> – You may reward others by sending them tokens.
          <br />
          <strong>Stage 6: Credits</strong> – See a summary of your actions: contributions, earnings, punishments, rewards, and your ending balance.
        </p>
        <p>
          All players must complete each stage before the group can move on. After Stage 6, the <strong>round ends</strong> and everyone starts the <strong>next round</strong> with a <strong>fresh set of 10 tokens</strong>. 
          <br /> 
          <strong>This cycle continues until all 5 rounds are complete</strong>.
        </p>
        <p><strong>Remember: Your goal is to earn as many tokens as possible.</strong></p>
      </div>
      <Button handleClick={next} autoFocus>
        <p>Next</p>
      </Button>
    </div>
  );
  }