import React from "react";

export function Example({ playerCount = 4 }) {
  const groupContribution = 12; // total contribution from the whole group
  const CONTRIBUTION_MULTIPLIER = 2; // the pool is doubled
  const doubledPool = groupContribution * CONTRIBUTION_MULTIPLIER; // total in the shared pool
  const individualShare = doubledPool / playerCount;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm space-y-2">
      <p><strong>Example:</strong></p>
      <p>You're in a group of <strong>{playerCount} players</strong>.</p>
      <p>Together, the group contributes {groupContribution} tokens to the shared pool.</p>
      <p>
        The pool gets <strong>doubled</strong>: {groupContribution} × {CONTRIBUTION_MULTIPLIER} ={" "}
        <strong>{doubledPool} tokens</strong>.
      </p>
      <p>
        That's <strong>{individualShare} tokens</strong> per player:<br />
        {doubledPool} ÷ {playerCount} = {individualShare}
      </p>
      <p>
        There are then opportunities for <strong>monitoring</strong>, <strong>punishment</strong>, and{" "}
        <strong>rewards</strong>.
      </p>
      <p>
        At the end of the round, your final balance becomes points, and tokens reset for the next round.
      </p>
    </div>
  );
}
