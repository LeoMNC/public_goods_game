// client/src/stages/Credits.jsx
import React, { useEffect, useState } from "react";
import { usePlayer, usePlayers, useRound } from "@empirica/core/player/classic/react";

export function Credits() {
  const player = usePlayer();
  const players = usePlayers();
  const round = useRound();

  const [roundSummary, setRoundSummary] = useState({
    startingTokens:    10,
    contribution:      0,
    monitoringCost:    0,
    punishCost:        0,
    transfersSent:     0,
    transfersReceived: 0,
    punishmentPenalty: 0,
    share:             0,
    endingTokens:      0,
  });

  const [points, setPoints] = useState(player.get("points") || 0);

  useEffect(() => {
    if (!player) return;

    const startingTokens    = 10;
    const contribution      = player.round.get("contribution")      || 0;
    const monitoringCost    = player.round.get("monitoringCost")    || 0;
    const punishCost        = player.round.get("punishCost")        || 0;
    const transfersSent     = player.round.get("transfersSent")     || 0;
    const share             = round.get("share")                    || 0;
    const punishmentPenalty = player.round.get("punishmentPenalty") || 0;
    const transfersReceived = player.round.get("transfersReceived") || 0;
    const endingTokens      = player.get("tokens")                  || 0;

    console.log("ROUND SUMMARY →", {
      startingTokens,
      contribution,
      monitoringCost,
      punishCost,
      transfersSent,
      share,
      punishmentPenalty,
      transfersReceived,
      endingTokens,
    });

    setRoundSummary({
      startingTokens,
      contribution,
      monitoringCost,
      punishCost,
      transfersSent,
      share,
      punishmentPenalty,
      transfersReceived,
      endingTokens,
    });

    setPoints(player.get("points") || 0);
  }, [player, players, round]);

  const {
    startingTokens,
    contribution,
    monitoringCost,
    punishCost,
    transfersSent,
    share,
    punishmentPenalty,
    transfersReceived,
    endingTokens,
  } = roundSummary;

  const netTransactions = 0
    - contribution
    - monitoringCost
    - punishCost
    - transfersSent
    + share
    - punishmentPenalty
    + transfersReceived;

  return (
    <div className="max-w-5xl mx-auto mt-6 p-8 bg-gray-50 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-empirica-700">
        Round Summary: {round.get("name")}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-2xl font-semibold text-empirica-600 mb-4">
          Your Round Transactions
        </h2>

        <div className="space-y-3">
          <p className="flex justify-between">
            <span>Starting tokens:</span>
            <span className="font-bold">{startingTokens}</span>
          </p>

          <div className="border-t border-gray-100 my-1" />

          <p className="flex justify-between">
            <span>Contributed to group pool:</span>
            <span className="font-bold text-amber-600">-{contribution}</span>
          </p>
          <p className="flex justify-between">
            <span>Spent on monitoring:</span>
            <span className="font-bold text-amber-600">-{monitoringCost}</span>
          </p>

          <div className="border-t border-gray-100 my-1" />

          <p className="flex justify-between">
            <span>Spent on punishing others:</span>
            <span className="font-bold text-amber-600">-{punishCost}</span>
          </p>
          <p className="flex justify-between">
            <span>Sent as transfers to others:</span>
            <span className="font-bold text-amber-600">-{transfersSent}</span>
          </p>

          <div className="border-t border-gray-100 my-1" />
          
          <p className="flex justify-between">
            <span>Share from group pool:</span>
            <span className="font-bold text-green-600">+{share}</span>
          </p>
          <p className="flex justify-between">
            <span>Lost from being punished:</span>
            <span className="font-bold text-red-600">-{punishmentPenalty}</span>
          </p>
          <p className="flex justify-between">
            <span>Received as transfers from others:</span>
            <span className="font-bold text-green-600">+{transfersReceived}</span>
          </p>

          <div className="border-t border-gray-200 my-2" />

          <p className="flex justify-between text-lg font-semibold">
            <span>Net transactions:</span>
            <span>{Number.isFinite(netTransactions) ? netTransactions : 0}</span>
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-empirica-50 to-empirica-100 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-empirica-700 mb-3">
          Round Outcome
        </h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <p className="text-lg mb-2">
              <span className="font-medium">Ending token balance:</span>
              <span className="text-xl font-bold ml-2">{endingTokens}</span>
            </p>
            <p className="text-lg">
              <span className="font-medium">Your accumulated points:</span>
              <span className="text-xl font-bold ml-2">{points}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              All tokens are converted to points at the end of each round.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => player.stage.set("submit", true)}
              className="px-8 py-3 bg-empirica-600 text-white text-lg rounded-xl shadow-lg hover:bg-empirica-700 transition"
            >
              Continue to Next Round
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
