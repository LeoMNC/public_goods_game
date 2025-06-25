// pages/Intermission.jsx
import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";

export function Intermission() {
  const player = usePlayer();
  const players = usePlayers();
  const contributionMultiplier = 2;

  const contribution = player.round.get("contribution") || 0;
  const share = round.get("share") || 0;
  const totalContribution = players.reduce((sum, p) => sum + (p.round.get("contribution") || 0), 0);
  const totalPool = totalContribution * contributionMultiplier;
  const meanContribution = totalContribution / players.length;
  const finalTokens = player.get("tokens")?.toFixed(2) ?? "–";

  // This is where the issue is - we need to get the monitored players from the current round
  const monitoredIds = player.round.get("monitoredPlayers") || [];
  const monitoredPlayers = players.filter((p) => monitoredIds.includes(p.id));
  const monitoringCost = monitoredPlayers.length;

  const handleContinue = () => {
    player.stage.set("submit", true);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-8 bg-gray-50 rounded-xl shadow-md">

      <hr className="my-6 border-gray-300" />

      <h1 className="text-3xl font-bold text-center mb-6 text-empirica-700">Intermission</h1>
      <div className="space-y-4 text-lg text-gray-800 mb-10">
        <p>
          From your <strong>10 initial tokens</strong>, you contributed <strong>{contribution} tokens</strong>.
        </p>
        <p>
          Over all {players.length} players, <strong>{totalContribution} tokens</strong> were contributed. The average contribution was <strong>{meanContribution.toFixed(2)}</strong> tokens.
        </p>
        <p>
          After a {contributionMultiplier}x multiplier, the pool became <strong>{totalPool.toFixed(2)} tokens</strong>. This was divided between all {players.length} players.
        </p>
        <p>
          So, each player (including you) received <strong>{share.toFixed(2)} tokens</strong>.
        </p>
        {monitoringCost > 0 ? (
          <p>
            You also monitored {monitoringCost === 1 ? "one other player" : `${monitoringCost} other players`}, which cost <strong>{monitoringCost} token{monitoringCost > 1 ? "s" : ""}</strong>.
          </p>
        ) : (
          <p>You did not monitor any other players this round.</p>
        )}
        <p>
          At present, you have <strong>{finalTokens} tokens</strong>.
        </p>
      </div>

      {monitoredPlayers.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-empirica-700">Monitoring Results</h2>
          <table className="table-auto border-collapse w-full mb-8 text-gray-800">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100">Player</th>
                <th className="border p-2 bg-gray-100">Donated Tokens</th>
                <th className="border p-2 bg-gray-100">Monitoring Cost</th>
              </tr>
            </thead>
            <tbody>
              {monitoredPlayers.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2">{p.get("name")}</td>
                  <td className="border p-2">{p.round.get("contribution") ?? "No data"}</td>
                  <td className="border p-2">1 token</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className="bg-white border-l-4 border-empirica-500 p-5 rounded-lg shadow-sm text-gray-700 text-base mb-10">
        <p>
          In the remainder of the round, you can spend these tokens on punishing and rewarding other players. Anything you have at the end of the round will convert from tokens to points, which will be counted at the end of the game. <strong>Remember, your job is to get as many points as possible.</strong>
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-empirica-600 text-white text-lg rounded-xl shadow-lg hover:bg-empirica-700 transition"
        >
          Done Reviewing Results - Continue to Next Stage
        </button>
      </div>
    </div>
  );
}