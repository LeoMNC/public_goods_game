// client/src/stages/Punish.jsx
import React from "react";
import { Scoreboard } from "../components/Scoreboard";
import { PunishmentComponent } from "../components/PunishmentComponent";

export function Punish() {
  return (
    <div className="mt-5 px-8 py-6 bg-white rounded-lg shadow-lg">
      <p className="mb-4">
        <strong>4.2.</strong> Pay 1 token to punish another player. Punished
        players lose 5 tokens before the next round.
      </p>
      <Scoreboard />
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-md">
          <PunishmentComponent />
        </div>
      </div>
    </div>
  );
}
