// server/src/callbacks.js
import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();
const PUNISH_MULTIPLIER = 5;
const CONTRIBUTION_MULTIPLIER = 2;

// Game Start
Empirica.onGameStart(({ game }) => {
  console.log("Game started");
  const treatment = game.get("treatment");
  console.log(
    "[⚙️ Treatment Parameters]",
    Object.entries(treatment).map(([key, val]) => `${key}: ${val}`)
  );
  const numRounds = treatment.numRounds;
  console.log(`Creating ${numRounds} rounds`);

  const stageNames = [
    "contribution", "monitor", "intermission",
     "punish", "transfer","credits"
    ];
  
  for (let i = 1; i <= numRounds; i++) {
    console.log(`Creating Round ${i} --------------------------`);
    const round = game.addRound({
      name: `Round ${i}`,
    });
    stageNames.forEach((stageName) => {
      round.addStage({
        name: stageName,
        duration: 10000,
      });
      console.log(`Round ${i}, stage ${stageName} created`);
      });
    console.log(`Round ${i} completed`)
  }
});

// Round Start: initialize tokens and round properties
Empirica.onRoundStart(({ round }) => {
  console.log(`Round started: ${round.get("name")}`);
  round.game.players.forEach((p) => {
    p.set("tokens", 10);
    p.round.set("monitoredPlayers", [])
    p.round.set("transfersSent", 0);
    p.round.set("transfersReceived", 0);
    p.round.set("contribution", 0);
    p.round.set("kept", 0);
    p.round.set("givenPunishments", []);
    p.round.set("punishmentReceived", 0);
    console.log(
      `Initialized Player ${p.id}: tokens=10, contribution=0, kept=0`
    );
  });
});


// Stage Start
Empirica.onStageStart(({ stage }) => {
  if (stage.get("name") !== "credits") return;
  const players = stage.game.players;
  const round = stage.round;

  // 1) Public‐goods returns
  players.forEach(p => {
    const share = round.get("playerShare") || 0;
    p.set("tokens", p.get("tokens") + share);
  });

  // 2) Incoming transfers
  players.forEach(p => {
    const rec = p.round.get("transfersReceived") || 0;
    p.set("tokens", p.get("tokens") + rec);
  });

  // 3) Punishment penalties (for targets)
  ///////// Build a map of how many times each player was hit
  const punishCount = {};
  players.forEach((p) => {
    (p.round.get("givenPunishments") || []).forEach((targetId) => {
      punishCount[targetId] = (punishCount[targetId] || 0) + 1;
    });
  });

  ///////// Now apply penalties and record for UI / later analysis
  players.forEach((p) => {
    const times   = punishCount[p.id] || 0;
    const penalty = times * PUNISH_MULTIPLIER;

    /////////// record how many times they were punished
    p.round.set("punishmentReceived", times);
    p.round.set("punishmentPenalty", penalty);

    /////////// actually deduct
    p.set("tokens", Math.max(0, p.get("tokens") - penalty));
  });

  console.log("Applied public‐goods returns, transfers, and punishments.");

});

// Stage End
Empirica.onStageEnded(({ stage }) => {
  const stageName = stage.get("name");
  const roundName = stage.round.get("name");
  const players = stage.game.players;
  console.log(`Stage ended: ${stageName} in round ${roundName}`);
  switch (stageName) {
    case "contribution":
      console.log("Processing contributions...");
      players.forEach(p => {
        const contribution = p.round.get("contribution");
        console.log(`Player ${p.id} contributed: ${contribution}`);
        // Immediately deduct contribution from tokens
        const postContributionTokens = p.get("tokens") - contribution;
        p.set("tokens", postContributionTokens);
        p.round.set("kept", postContributionTokens);
        console.log(`Player ${p.id} donated: ${contribution}, new balance: ${p.get("tokens")}`);
      });

      // Calculate total contribution and store at round level for later use
      const roundContribution = players.reduce((sum, p) => sum + p.round.get("contribution"), 0);
      stage.round.set("totalContribution", roundContribution);
      const roundPool = roundContribution * CONTRIBUTION_MULTIPLIER;
      const share = roundPool / players.length;
      stage.round.set("playerShare", share);
      console.log(`Total round contribution: ${roundContribution}`);
      console.log(`Multiplied pool (x${CONTRIBUTION_MULTIPLIER}): ${roundPool}`);
      console.log(`Each player will receive ${share} from the pool`);
      break;

    case "monitor":
      // Get the total contribution from the round data
      players.forEach(p => {
        // Deduct one token for each player they monitor
        const monitoredPlayers = p.round.get("monitoredPlayers") || [];
        const monitoringCost = monitoredPlayers.length;
        const postMonitoringTokens = p.get("tokens") - monitoringCost;
        p.round.set("monitoringCost", monitoringCost);
        p.set("tokens", Math.max(0, postMonitoringTokens));
        console.log(
          `monitoring cost: ${monitoringCost}, ` +
          `new balance: ${postMonitoringTokens}`
        );

        // Store monitoring results for the players they monitored
        const monitoringResults = monitoredPlayers.map(monitoredId => {
          const monitoredPlayer = players.find(mp => mp.id === monitoredId);
          return {
            id: monitoredPlayer.id,
            contribution: monitoredPlayer.round.get("contribution"),
            kept: monitoredPlayer.round.get("kept")
          };
        });
        p.round.set("monitoringResults", monitoringResults);
      });
      break;

    case "intermission":
      console.log("Intermission stage, players can review contributions...");
      break;

    case "punish":
      console.log("Punishment stage: charging punisher costs only…");
      players.forEach((p) => {
        const given = p.round.get("givenPunishments") || [];
        const punishCost = given.length;            // 1 token per punishment
        const newTokens = Math.max(0, p.get("tokens") - punishCost);
        p.set("tokens", newTokens);
        p.round.set("punishmentCost", punishCost);  // if you want to record it
        console.log(
          `Player ${p.id} paid ${punishCost} token${punishCost !== 1 ? "s" : ""} for punishing, ` +
          `new balance: ${newTokens}`
        );
      });
      break;

    case "transfer":
      console.log("Transfer stage, players can transfer tokens...");
      // 1. Deduct transfers sent
      players.forEach((p) => {
        const sent = p.round.get("transfersSent") || 0;
        const preTokens = p.get("tokens") || 0;
        const postTransferSentTokens = preTokens - sent;
        p.set("tokens", Math.max(0, postTransferSentTokens));
        console.log(`Player ${p.id} sent ${sent} tokens, new balance: ${p.get("tokens")}`);
      });
      break;
      
    case "credits":
      console.log("Credits stage, displaying final results...");
      players.forEach(p => {
        const tokens = p.get("tokens");
        const points = p.get("points") || 0;
        console.log(`Player ${p.id} - Tokens: ${tokens}, Points: ${points}`);
      });
      break;

    default:
      console.warn(`Unhandled stage: ${stageName}`);
      break;
    }
});

// Round End
Empirica.onRoundEnded(({ round }) => {
  console.log(`Round ended: ${round.get("name")}`);
  const players = round.game.players;
  players.forEach(p => {
    const tokens = p.get("tokens");
    const oldPoints = p.get("points") || 0;
    const newPoints = oldPoints + tokens;
    p.set("points", newPoints);
    console.log(`Player ${p.id} tokens at end of round: ${tokens}`);
    console.log(`Player ${p.id} points at end of round: ${p.get("points") || 0}`);
  });
});

// Game End
Empirica.onGameEnded(({ game }) => {
  console.log("Game ended");
  const players = game.players;
  players.forEach(p => {
    const finalTokens = p.get("tokens");
    console.log(`Player ${p.id} final tokens: ${finalTokens}`);
  });
});