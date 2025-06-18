// server/src/callbacks.js
import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();

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

  const stageNames = ["contribution", "monitor", "intermission", "punish", 
    "transfer",
    "credits"];
  
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
  round.currentGame.players.forEach((p) => {
    p.set("tokens", 10);
    p.round.set("contribution", 0);
    p.round.set("kept", 0);
    p.round.set("share", 0);
    p.round.set("givenPunishments", []);
    p.round.set("punishmentReceived", 0);
    console.log(
      `Initialized Player ${p.id}: tokens=10, contribution=0, kept=0, share=0`
    );
  });
});


// Stage Start
Empirica.onStageStart(({ stage }) => {
  console.log(`Stage started: ${stage.get("name")} in round ${stage.round.get("name")}`);
});

// Stage End
Empirica.onStageEnded(({ stage }) => {
  const stageName = stage.get("name");
  const roundName = stage.round.get("name");
  const players = stage.currentGame.players;
  console.log(`Stage ended: ${stageName} in round ${roundName}`);

  switch (stageName) {
    case "contribution":
      console.log("Processing contributions...");
      players.forEach(p => {
        const contribution = p.round.get("contribution");
        console.log(`Player ${p.id} contributed: ${contribution}`);

        // Immediately deduct contribution from tokens
        const keptTokens = p.get("tokens") - contribution;
        p.set("tokens", keptTokens);
        p.round.set("kept", 10 - keptTokens);
        console.log(`Player ${p.id} kept: ${p.get("kept")}, new balance: ${p.get("tokens")}`);
      });

      // Calculate total contribution and store at round level for later use
      const roundContribution = players.reduce((sum, p) => sum + p.round.get("contribution"), 0);
      stage.round.set("totalContribution", roundContribution);
      console.log(`Total round contribution: ${roundContribution}`);
      break;

    case "monitor":
      console.log("Distributing public good returns after monitoring...");
      const contributionMultiplier = 2;

      // Get the total contribution from the round data
      const totalContribution = stage.round.get("totalContribution");
      const roundPool = totalContribution * contributionMultiplier;
      const share = roundPool / players.length;

      console.log(`Multiplied pool (x${contributionMultiplier}): ${roundPool}`);
      console.log(`Each player receives: ${share}`);

      players.forEach(p => {
        // Deduct one token for each player they monitor
        const monitoredPlayers = p.round.get("monitoredPlayers") || [];
        const monitoringCost = monitoredPlayers.length;
        const newTotal = p.get("tokens") + share - monitoringCost;

        console.log(
          `Player ${p.id} receives share: ${share}, ` +
          `monitoring cost: ${monitoringCost}, ` +
          `new balance: ${newTotal}`
        );

        p.round.set("share", share);
        p.round.set("monitoringCost", monitoringCost);
        p.set("tokens", newTotal);

        // Store monitoring results for the players they monitored
        const monitoringResults = monitoredPlayers.map(monitoredId => {
          const monitoredPlayer = monitorPlayers.find(mp => mp.id === monitoredId);
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
      players.forEach(p => {
        const contribution = p.round.get("contribution");
        const kept = p.round.get("kept");
        console.log(`Player ${p.id} - Contribution: ${contribution}, Kept: ${kept}`);
      });
      break;

    case "punish":
      console.log("Punishment stage: applying token updates...");
      // Tally punishments from all players
      const punishmentMap = {};
      players.forEach((p) => {
        const given = p.round.get("givenPunishments") || [];
        given.forEach((targetId) => {
          punishmentMap[targetId] = (punishmentMap[targetId] || 0) + 1;
        });
      });
      players.forEach((p) => {
        const given = p.round.get("givenPunishments") || [];
        const punishCost = given.length;
        const tokensPostPunishCost = p.get("tokens") - punishCost;
        p.set("tokens", Math.max(0, tokensPostPunishCost));
        console.log(`Player ${p.id} paid ${punishCost} tokens for punishing, new balance: ${p.get("tokens")}`);
        const received = punishmentMap[p.id] || 0;
        const penalty = received * 5;
        p.round.set("punishmentReceived", received);
        p.round.set("punishmentPenalty", penalty);
        p.set("tokens", Math.max(0, p.get("tokens") - penalty));
        console.log(`Player ${p.id}, punished ${received} time(s), lost ${penalty} -> ${p.get("tokens")}`);
      });
      break;

      case "transfer":
        console.log("Transfer stage, players can transfer tokens...");
        const transferPlayers = stage.currentGame.players;
        transferPlayers.forEach(p => {
          const tokens = p.get("tokens");
          console.log(`Player ${p.id} has ${tokens} tokens available for transfer`);
          // Here you would implement the logic for transferring tokens
        });
      break;
      
    case "credits":
      console.log("Credits stage, displaying final results...");
      const creditPlayers = stage.currentGame.players;
      creditPlayers.forEach(p => {
        const tokens = p.get("tokens");
        const points = p.get("points") || 0;
        console.log(`Player ${p.id} - Tokens: ${tokens}, Points: ${points}`);
      });
      break;
    }
});

// Round End
Empirica.onRoundEnded(({ round }) => {
  console.log(`Round ended: ${round.get("name")}`);
  const players = round.currentGame.players;
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

