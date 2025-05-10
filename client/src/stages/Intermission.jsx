// pages/Intermission.jsx
// pages/Intermission.jsx
import React from "react";
import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
import { Scoreboard } from "../components/Scoreboard";

export function Intermission() {
  const player = usePlayer();
  const players = usePlayers();

  const contribution = player.round.get("contribution") || 0;
  const share = player.round.get("share") || 0;
  const totalContribution = players.reduce((sum, p) => sum + (p.round.get("contribution") || 0), 0);
  const totalPool = totalContribution * 1.5;
  const meanContribution = totalContribution / players.length;

  const monitoredIds = player.get("monitoredPlayers") || [];
  const monitoredPlayers = players.filter((p) => monitoredIds.includes(p.id));

  const handleContinue = () => {
    player.stage.set("submit", true);
  };

  return (
    <div className="mt-3 sm:mt-5 p-10">
      <Scoreboard />

      <h1 className="text-2xl font-bold mb-4">Round Recap</h1>
      <div className="mb-8">
        <p>You contributed <strong>{contribution.toFixed(2)}</strong> of your 10 coins.</p>
        <p>On average, players contributed <strong>{meanContribution.toFixed(2)}</strong> coins.</p>
        <p>In total, <strong>{players.length}</strong> players contributed <strong>{totalContribution.toFixed(2)}</strong> coins.</p>
        <p>This was multiplied by 1.5 to get <strong>{totalPool.toFixed(2)}</strong> coins back.</p>
        <p>Each player, including you, receives <strong>{share.toFixed(2)}</strong> coins.</p>
        <p>You contributed <strong>{contribution.toFixed(2)}</strong> coins and got <strong>{share.toFixed(2)}</strong> back.</p>
        <p>Net change: <strong>{(share - contribution).toFixed(2)}</strong> coins.</p>
        <p>Total coins you earned this round: <strong>{player.get("coins").toFixed(2)}</strong></p>
      </div>

      <h1 className="text-2xl font-bold mb-4">Monitoring Results</h1>
      {monitoredPlayers.length === 0 ? (
        <p className="mb-6">You chose not to monitor anyone this round.</p>
      ) : (
        <table className="table-auto border-collapse w-full mb-6">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">Player</th>
              <th className="border p-2 bg-gray-100">Donated Coins</th>
              <th className="border p-2 bg-gray-100">Monitoring Cost</th>
            </tr>
          </thead>
          <tbody>
            {monitoredPlayers.map((p) => (
              <tr key={p.id}>
                <td className="border p-2">{p.get("name")}</td>
                <td className="border p-2">{p.round.get("contribution") ?? "No data"}</td>
                <td className="border p-2">1 coin</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-empirica-600 text-white rounded-lg shadow-md hover:bg-empirica-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// import React from "react";
// import { usePlayer, usePlayers } from "@empirica/core/player/classic/react";
// import { Scoreboard } from "../components/Scoreboard";

// export function Intermission() {
//   const player = usePlayer();
//   const players = usePlayers();

//   const monitoredIds = player.get("monitoredPlayers") || [];
//   const monitoredPlayers = players.filter((p) => monitoredIds.includes(p.id));

//   const handleContinue = () => {
//     player.stage.set("submit", true);
//   };

//   return (
//     <div className="mt-3 sm:mt-5 p-10">
//       <Scoreboard />

//       <h1 className="text-2xl font-bold mb-4">Monitoring Results</h1>

//       {monitoredPlayers.length === 0 ? (
//         <p className="mb-6">You chose not to monitor anyone this round.</p>
//       ) : (
//         <table className="table-auto border-collapse w-full mb-6">
//           <thead>
//             <tr>
//               <th className="border p-2 bg-gray-100">Player</th>
//               <th className="border p-2 bg-gray-100">Donated Coins</th>
//               <th className="border p-2 bg-gray-100">Monitoring Cost</th>
//             </tr>
//           </thead>
//           <tbody>
//             {monitoredPlayers.map((p) => (
//               <tr key={p.id}>
//                 <td className="border p-2">{p.get("name")}</td>
//                 <td className="border p-2">{p.round.get("contribution") ?? "No data"}</td>
//                 <td className="border p-2">1 coin</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       <div className="flex justify-center">
//         <button
//           onClick={handleContinue}
//           className="px-6 py-3 bg-empirica-600 text-white rounded-lg shadow-md hover:bg-empirica-700 transition"
//         >
//           Continue
//         </button>
//       </div>
//     </div>
//   );
// }
