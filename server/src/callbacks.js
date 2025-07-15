// server/src/callbacks.js
import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();
const PUNISH_MULTIPLIER = 5;
const CONTRIBUTION_MULTIPLIER = 2;
import { useRound, usePlayers } from "@empirica/core/player/classic/react";


// Game Start
Empirica.onGameStart(({ game }) => {
  console.log("[GameStart] Game started");
  const treatment = game.get("treatment");
  console.log(
    "[GameStart] Treatment Parameters:",
    Object.entries(treatment).map(([key, val]) => `${key}: ${val}`)
  );
  const numRounds = treatment.numRounds;
  console.log(`[GameStart] Creating ${numRounds} rounds`);

  const stageNames = [
    "contribution", "monitor", "intermission",
    "punish", "transfer", "credits"
  ];
  
  for (let i = 1; i <= numRounds; i++) {
    console.log(`[GameStart] Creating Round ${i}`);
    const round = game.addRound({
      name: `Round ${i}`,
    });
    
    stageNames.forEach((stageName) => {
      round.addStage({
        name: stageName,
        duration: 10000,
      });
      console.log(`[GameStart] Round ${i}, stage ${stageName} created`);
    });
    console.log(`[GameStart] Round ${i} finalized`);
  }
});

// Round Start: initialize tokens and round properties
Empirica.onRoundStart(({ round }) => {  
  console.log(`[RoundStart] Round started: ${round.get("name")}`);
  const players = round.currentGame.players; // line 43
  players.forEach((p) => {
    p.set("tokens", 10);
    p.round.set("monitoredPlayers", []);
    p.round.set("transfersSent", 0);
    p.round.set("transfersReceived", 0);
    p.round.set("contribution", 0);
    p.round.set("kept", 0);
    p.round.set("givenPunishments", []);
    p.round.set("punishmentReceived", 0);
    console.log(
      `[RoundStart] Initialized Player ${p.get("name")}: tokens=10, contribution=0, kept=0`
    );
  });
});

// Stage Start
Empirica.onStageStart(({ stage }) => {  
  console.log(`[StageStart] Stage started: ${stage.get("name")}`);
  if (stage.get("name") !== "credits") return;
  
  const round = stage.round;
  console.log("[StageStart] Processing credits stage");
  const players = round.currentGame.players;  
  // 1) Public‐goods returns
  players.forEach(p => {
    const share = round.get("share") || 0;
    const currentTokens = p.get("tokens") || 0;
    p.set("tokens", currentTokens + share);
    console.log(`[StageStart] Player ${p.get("name")} received share: ${share}, new tokens: ${currentTokens + share}`);
  });

  // 2) Incoming transfers
  players.forEach(p => {
    const rec = p.round.get("transfersReceived") || 0;
    const currentTokens = p.get("tokens") || 0;
    p.set("tokens", currentTokens + rec);
    console.log(`[StageStart] Player ${p.get("name")} received transfers: ${rec}, new tokens: ${currentTokens + rec}`);
  });

  // 3) Punishment penalties (for targets)  - FIXED
  // Create a map to accumulate total punishments per player
  const punishmentTotals = {};
  players.forEach(p => {
    punishmentTotals[p.get("name")] = 0;
  });
  
  // Accumulate punishments from all players
  players.forEach(punisher => {
    const penaltyMap = punisher.round.get("penaltyMap") || {};
    for (const [targetId, amount] of Object.entries(penaltyMap)) {
      if (punishmentTotals[targetId] !== undefined) {
        punishmentTotals[targetId] += amount;
      }
    }
  });
  
  // Apply punishments to targets
  players.forEach(p => {
    const punishment = punishmentTotals[p.get("name")] || 0;
    p.round.set("punishmentPenalty", punishment);
    
    if (punishment > 0) {
      const currentTokens = p.get("tokens") || 0;
      p.set("tokens", Math.max(0, currentTokens - punishment));
      console.log(`[StageStart] Player ${p.get("name")} punished: -${punishment}, new tokens: ${currentTokens - punishment}`);
    }
  });

  console.log("[StageStart] Applied public‐goods returns, transfers, and punishments.");
});

// Stage End
Empirica.onStageEnded(({ stage }) => { 
  const stageName = stage.get("name");
  const round = stage.round;
  const roundName = round.get("name");
  console.log(`[StageEnd] Stage ended: ${stageName} in round ${roundName}`);
  const players = round.currentGame.players;
  switch (stageName) {
    case "contribution":
      console.log("[StageEnd] Processing contributions...");
      players.forEach(p => {
        const contribution = p.round.get("contribution") || 0;
                
        const currentTokens = p.get("tokens") || 0;
        const postContributionTokens = currentTokens - contribution;
        p.set("tokens", postContributionTokens);
        p.round.set("kept", postContributionTokens);
        
        console.log(
          `[StageEnd] Player ${p.get("name")} contributed: ${contribution}, ` +
          `new balance: ${postContributionTokens}`
        );
      });

      // Calculate total contribution
      const roundContribution = players.reduce(
        (sum, p) => sum + (p.round.get("contribution") || 0), 
        0
      );
      round.set("totalContribution", roundContribution);
      
      const roundPool = roundContribution * CONTRIBUTION_MULTIPLIER;
      const share = players.length > 0 ? roundPool / players.length : 0;
      round.set("share", share);
      
      console.log(`[StageEnd] Total round contribution: ${roundContribution}`);
      console.log(`[StageEnd] Multiplied pool (x${CONTRIBUTION_MULTIPLIER}): ${roundPool}`);
      console.log(`[StageEnd] Each player will receive ${share} from the pool`);
      break;

case "monitor":
  console.log("[StageEnd] Processing monitoring...");
  players.forEach(p => {
    const monitoredPlayers = p.round.get("monitoredPlayers") || [];
    // Get the cost that was already set client-side
    const monitoringCost = p.round.get("monitoringCost") || 0;
    
    console.log(
      `[StageEnd] Player ${p.get("name")} monitored ${monitoredPlayers.length} players, cost: ${monitoringCost}`
    );

    // Store monitoring results
    const monitoringResults = monitoredPlayers.map(monitoredId => {
      const monitoredPlayer = players.find(mp => mp.id === monitoredId);
      return monitoredPlayer ? {
        id: monitoredPlayer.id,
        contribution: monitoredPlayer.round.get("contribution") || 0,
        kept: monitoredPlayer.round.get("kept") || 0
      } : null;
    }).filter(Boolean);
    
    p.round.set("monitoringResults", monitoringResults);
    // Ensure cost is preserved
    p.round.set("monitoringCost", monitoringCost);
  });
  break;

    case "intermission":
      console.log("[StageEnd] Intermission stage completed");
      break;

    case "punish":
      console.log("[StageEnd] Processing punishment costs...");
      players.forEach((p) => {
        const given = p.round.get("givenPunishments") || [];
        // Get the cost that was already set client-side
        const punishCost = p.round.get("punishmentCost") || given.length;
        
        const currentTokens = p.get("tokens") || 0;
        const newTokens = Math.max(0, currentTokens - punishCost);
        p.set("tokens", newTokens);
        p.round.set("punishCost", punishCost);
        
        console.log(
          `[StageEnd] Player ${p.get("name")} paid ${punishCost} token${punishCost !== 1 ? "s" : ""} for punishing, ` +
          `new balance: ${newTokens}`
        );
      });
      break;

    case "transfer":
      console.log("[StageEnd] Processing transfers...");
      players.forEach((p) => {
        const sent = p.round.get("transfersSent") || 0;
        const currentTokens = p.get("tokens") || 0;
        const postTransferSentTokens = currentTokens - sent;
        p.set("tokens", Math.max(0, postTransferSentTokens));
        
        console.log(
          `[StageEnd] Player ${p.get("name")} sent ${sent} tokens, ` +
          `new balance: ${postTransferSentTokens}`
        );
      });
      break;
      
    case "credits":
      console.log("[StageEnd] Credits stage completed");
      players.forEach(p => {
        console.log(
          `[StageEnd] Player ${p.get("name")} - Tokens: ${p.get("tokens")}, Points: ${p.get("points") || 0}`
        );
      });
      break;

    default:
      console.warn(`[StageEnd] Unhandled stage: ${stageName}`);
      break;
  }
});

// Round End
Empirica.onRoundEnded(({ round }) => {  
  console.log(`[RoundEnd] Round ended: ${round.get("name")}`);
  const players = round.currentGame.players;
  players.forEach(p => {  
    const tokens = p.get("tokens") || 0;
    const oldPoints = p.get("points") || 0;
    const newPoints = oldPoints + tokens;
    p.set("points", newPoints);
    
    console.log(
      `[RoundEnd] Player ${p.get("name")} tokens: ${tokens}, ` +
      `points: ${oldPoints} → ${newPoints}`
    );
  });
});

// Game End
Empirica.onGameEnded(({ game }) => {
  console.log("[GameEnd] Game ended");
  game.players.forEach(p => {
    console.log(
      `[GameEnd] Player ${p.get("name")} final tokens: ${p.get("tokens")}, ` +
      `final points: ${p.get("points") || 0}`
    );
  });
});

// **Add this at the very end of the file**
Empirica.on("init", ({ server }) => {
  // For any request not handled by Empirica's API or sockets, serve React
  server.app.get("*", (req, res, next) => {
    // Skip Empirica GraphQL endpoint and socket.io
    if (
      req.path.startsWith("/query") ||
      req.path.startsWith("/socket.io")
    ) {
      return next();
    }
    // Serve the built React app
    res.sendFile(
      path.resolve(__dirname, "../../client/build/index.html")
    );
  });
});