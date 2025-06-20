// server/src/callbacks.js
import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();
const PUNISH_MULTIPLIER = 5;
const CONTRIBUTION_MULTIPLIER = 2;

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
Empirica.onRoundStart(({ game, round }) => {  // Added game to context
  console.log(`[RoundStart] Round started: ${round.get("name")}`);
  
  game.players.forEach((p) => {
    p.set("tokens", 10);
    p.round.set("monitoredPlayers", []);
    p.round.set("transfersSent", 0);
    p.round.set("transfersReceived", 0);
    p.round.set("contribution", 0);
    p.round.set("kept", 0);
    p.round.set("givenPunishments", []);
    p.round.set("punishmentReceived", 0);
    console.log(
      `[RoundStart] Initialized Player ${p.id}: tokens=10, contribution=0, kept=0`
    );
  });
});

// Stage Start
Empirica.onStageStart(({ game, round, stage }) => {  // Added game to context
  console.log(`[StageStart] Stage started: ${stage.get("name")}`);
  
  if (stage.get("name") !== "credits") return;
  
  console.log("[StageStart] Processing credits stage");
  const players = game.players;  
  // 1) Public‐goods returns
  players.forEach(p => {
    const share = round.get("playerShare") || 0;
    const currentTokens = p.get("tokens") || 0;
    p.set("tokens", currentTokens + share);
    console.log(`[StageStart] Player ${p.id} received share: ${share}, new tokens: ${currentTokens + share}`);
  });

  // 2) Incoming transfers
  players.forEach(p => {
    const rec = p.round.get("transfersReceived") || 0;
    const currentTokens = p.get("tokens") || 0;
    p.set("tokens", currentTokens + rec);
    console.log(`[StageStart] Player ${p.id} received transfers: ${rec}, new tokens: ${currentTokens + rec}`);
  });

  // 3) Punishment penalties (for targets)
  // Build a map of how many times each player was hit
  const punishCount = {};
  players.forEach((p) => {
    (p.round.get("givenPunishments") || []).forEach((targetId) => {
      punishCount[targetId] = (punishCount[targetId] || 0) + 1;
    });
  });

  // Apply penalties and record for UI / later analysis
  players.forEach((p) => {
    const times = punishCount[p.id] || 0;
    const penalty = times * PUNISH_MULTIPLIER;

    p.round.set("punishmentReceived", times);
    p.round.set("punishmentPenalty", penalty);

    const currentTokens = p.get("tokens") || 0;
    const newTokens = Math.max(0, currentTokens - penalty);
    p.set("tokens", newTokens);
    
    console.log(
      `[StageStart] Player ${p.id} punished ${times} time(s), penalty: ${penalty}, new tokens: ${newTokens}`
    );
  });

  console.log("[StageStart] Applied public‐goods returns, transfers, and punishments.");
});

// Stage End
Empirica.onStageEnded(({ game, round, stage }) => {  // Added game to context
  const stageName = stage.get("name");
  const roundName = round.get("name");
  console.log(`[StageEnd] Stage ended: ${stageName} in round ${roundName}`);
  
  const players = game.players;
  switch (stageName) {
    case "contribution":
      console.log("[StageEnd] Processing contributions...");
      players.forEach(p => {
        const contribution = p.round.get("contribution") || 0;
        console.log(`[StageEnd] Player ${p.id} contributed: ${contribution}`);
        
        const currentTokens = p.get("tokens") || 0;
        const postContributionTokens = currentTokens - contribution;
        p.set("tokens", postContributionTokens);
        p.round.set("kept", postContributionTokens);
        
        console.log(
          `[StageEnd] Player ${p.id} donated: ${contribution}, ` +
          `new balance: ${postContributionTokens}`
        );
      });

      // Calculate total contribution
      const roundContribution = players.reduce(
        (sum, p) => sum + (p.round.get("contribution") || 0), 
        0
      );
      stage.round.set("totalContribution", roundContribution);
      
      const roundPool = roundContribution * CONTRIBUTION_MULTIPLIER;
      const share = players.length > 0 ? roundPool / players.length : 0;
      stage.round.set("playerShare", share);
      
      console.log(`[StageEnd] Total round contribution: ${roundContribution}`);
      console.log(`[StageEnd] Multiplied pool (x${CONTRIBUTION_MULTIPLIER}): ${roundPool}`);
      console.log(`[StageEnd] Each player will receive ${share} from the pool`);
      break;

    case "monitor":
      console.log("[StageEnd] Processing monitoring costs...");
      players.forEach(p => {
        const monitoredPlayers = p.round.get("monitoredPlayers") || [];
        const monitoringCost = monitoredPlayers.length;
        
        const currentTokens = p.get("tokens") || 0;
        const postMonitoringTokens = currentTokens - monitoringCost;
        p.round.set("monitoringCost", monitoringCost);
        p.set("tokens", Math.max(0, postMonitoringTokens));
        
        console.log(
          `[StageEnd] Player ${p.id} monitoring cost: ${monitoringCost}, ` +
          `new balance: ${postMonitoringTokens}`
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
      });
      break;

    case "intermission":
      console.log("[StageEnd] Intermission stage completed");
      break;

    case "punish":
      console.log("[StageEnd] Processing punishment costs...");
      players.forEach((p) => {
        const given = p.round.get("givenPunishments") || [];
        const punishCost = given.length;
        
        const currentTokens = p.get("tokens") || 0;
        const newTokens = Math.max(0, currentTokens - punishCost);
        p.set("tokens", newTokens);
        p.round.set("punishmentCost", punishCost);
        
        console.log(
          `[StageEnd] Player ${p.id} paid ${punishCost} token${punishCost !== 1 ? "s" : ""} for punishing, ` +
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
          `[StageEnd] Player ${p.id} sent ${sent} tokens, ` +
          `new balance: ${postTransferSentTokens}`
        );
      });
      break;
      
    case "credits":
      console.log("[StageEnd] Credits stage completed");
      players.forEach(p => {
        console.log(
          `[StageEnd] Player ${p.id} - Tokens: ${p.get("tokens")}, Points: ${p.get("points") || 0}`
        );
      });
      break;

    default:
      console.warn(`[StageEnd] Unhandled stage: ${stageName}`);
      break;
  }
});

// Round End
Empirica.onRoundEnded(({ game, round }) => {  // Added game to context
  console.log(`[RoundEnd] Round ended: ${round.get("name")}`);
  
  game.players.forEach(p => {  
    const tokens = p.get("tokens") || 0;
    const oldPoints = p.get("points") || 0;
    const newPoints = oldPoints + tokens;
    p.set("points", newPoints);
    
    console.log(
      `[RoundEnd] Player ${p.id} tokens: ${tokens}, ` +
      `points: ${oldPoints} → ${newPoints}`
    );
  });
});

// Game End
Empirica.onGameEnded(({ game }) => {
  console.log("[GameEnd] Game ended");
  game.players.forEach(p => {
    console.log(
      `[GameEnd] Player ${p.id} final tokens: ${p.get("tokens")}, ` +
      `final points: ${p.get("points") || 0}`
    );
  });
});