// client/src/stages/Credits.jsx
import React, { useEffect, useState } from "react";
import { usePlayer, usePlayers, useRound } from "@empirica/core/player/classic/react";

export function Credits() {
  const player = usePlayer();
  const players = usePlayers();
  const round = useRound();
  const [roundSummary, setRoundSummary] = useState({
    startingCoins: 10,
    contributionSpent: 0,
    monitoringSpent: 0,
    share: 0,
    punishmentSpent: 0,
    punishmentReceived: 0,
    transfersSent: 0,
    transfersReceived: 0,
    endingCoins: 0
  });
  const [points, setPoints] = useState(player.get("points") || 0);

  useEffect(() => {
    // Get the current round data directly from player and player.round
    // Making sure to access the specific data fields that were actually set during gameplay
    const startingCoins = player.round.get("initialCoins") || player.get("initialCoins") || 10;
    const contributionSpent = player.round.get("contribution") || player.round.get("contributionAmount") || 0;
    const monitoringSpent = player.round.get("monitoringCost") || player.round.get("monitoringAmount") || 0;
    const totalContribution = round.get("totalContribution");
    const contributionMultiplier = 2;
    const roundPool = totalContribution * contributionMultiplier;
    const share = roundPool / players.length;
    
    const punishmentSpent = player.round.get("punishSpent") || player.round.get("punishmentSpent") || 0;
    const punishmentReceived = player.round.get("punishmentReceived") || 0;
    const transfersSent = player.round.get("transferSpent") || player.round.get("transfersSent") || 0;
    let transfersReceived = player.round.get("transfersReceived") || 0;
    if (transfersReceived === 0) {
      players.forEach(p => {
        if (p.id !== player.id) {
          const transfers = p.round.get("transfers") || {};
          transfersReceived += transfers[player.id] || 0;
        }
      });
    }
    const endingCoins = player.get("coins") || 0;
    
    // For debugging - log all relevant data to console
    console.log("Player data:", {
      id: player.id,
      roundId: round.id,
      startingCoins,
      contributionSpent,
      monitoringSpent,
      share,
      punishmentSpent,
      punishmentReceived,
      transfersSent,
      transfersReceived,
      endingCoins,
      playerRoundData: player.round.data,
      playerData: player.data
    });
    
    // Update summary
    setRoundSummary({
      startingCoins,
      contributionSpent,
      monitoringSpent,
      share,
      punishmentSpent,
      punishmentReceived,
      transfersSent,
      transfersReceived,
      endingCoins
    });
    // Update points
    setPoints(player.get("points") || 0);
  }, [player, players, round]);

  return (
    <div className="max-w-5xl mx-auto mt-6 p-8 bg-gray-50 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-empirica-700">Round Summary: {round.get("name")}</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-2xl font-semibold text-empirica-600 mb-4">Your Round Transactions</h2>
        <div className="space-y-3">
          <p className="flex justify-between">
            <span>Starting coins:</span> 
            <span className="font-bold">{roundSummary.startingCoins}</span>
          </p>
          <div className="border-t border-gray-100 my-1"></div>
          {/* Contributions Section */}
          <p className="flex justify-between">
            <span>Contributed to group pool:</span> 
            <span className="font-bold text-amber-600">-{roundSummary.contributionSpent}</span>
          </p>
          <p className="flex justify-between">
            <span>Spent on monitoring:</span> 
            <span className="font-bold text-amber-600">-{roundSummary.monitoringSpent}</span>
          </p>
          <p className="flex justify-between">
            <span>Share from group pool:</span>
            <span className="font-bold text-green-600">+{roundSummary.share}</span>
          </p>
          <div className="border-t border-gray-100 my-1"></div>
          {/* Punishments Section */}
          <p className="flex justify-between">
            <span>Spent on punishing others:</span> 
            <span className="font-bold text-amber-600">-{roundSummary.punishmentSpent}</span>
          </p>
          <p className="flex justify-between">
            <span>Lost from being punished:</span> 
            <span className="font-bold text-red-600">-{roundSummary.punishmentReceived}</span>
          </p>
          <div className="border-t border-gray-100 my-1"></div>
          {/* Transfers Section */}
          <p className="flex justify-between">
            <span>Sent as transfers to others:</span> 
            <span className="font-bold text-amber-600">-{roundSummary.transfersSent}</span>
          </p>
          <p className="flex justify-between">
            <span>Received as transfers from others:</span> 
            <span className="font-bold text-green-600">+{roundSummary.transfersReceived}</span>
          </p>
          {/* Final Calculation */}
          <div className="border-t border-gray-200 my-2"></div>
          <p className="flex justify-between text-lg font-semibold">
            <span>Net transactions:</span> 
            <span>
              {roundSummary.share
                - roundSummary.contributionSpent
                - roundSummary.monitoringSpent
              - roundSummary.punishmentSpent 
              - roundSummary.punishmentReceived 
              - roundSummary.transfersSent 
              + roundSummary.transfersReceived
              }
            </span>
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-empirica-50 to-empirica-100 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-empirica-700 mb-3">Round Outcome</h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <p className="text-lg mb-2">
              <span className="font-medium">Ending coin balance:</span> 
              <span className="text-xl font-bold ml-2">{roundSummary.endingCoins}</span>
            </p>
            <p className="text-lg">
              <span className="font-medium">Your accumulated points:</span>
              <span className="text-xl font-bold ml-2">{points}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              All coins are converted to points at the end of each round.
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