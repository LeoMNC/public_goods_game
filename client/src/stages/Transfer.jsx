// client/src/stages/Transfer.jsx
import React from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";
import { TransferBoard } from "../components/TransferBoard";

export function Transfer() {
  const player = usePlayer();

  return (
    <div className="mt-3 sm:mt-5 p-20">
      <p>
        <strong>4.1</strong> Transfer some tokens to another player. You can reward them for being nice!
      </p>

      <div className="flex w-sw justify-center">
        <div className="p-10">
          <h1 className="text-xl font-bold">To whom would you like to transfer tokens?</h1>
          <TransferBoard />
        </div>
      </div>
    </div>
  );
}
