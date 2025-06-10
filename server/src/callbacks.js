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
  
  for (let i = 2; i <= numRounds; i++) {
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
  }
);

// Round Start
Empirica.onRoundStart(({ round }) => {
  console.log(`Round started: ${round.get("name")}`);
  const players = round.currentGame.players;
  players.forEach(p => {
    p.set("coins", 10);
    p.round.set("contribution", 0);
    p.round.set("kept", 0);
    console.log(`Initialized Player ${p.id}: coins=10, contribution=0, kept=0`);
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
  console.log(`Stage ended: ${stageName} in round ${roundName}`);

  switch (stageName) {  
    case "contribution":
      console.log("Processing contributions...");
      const players = stage.currentGame.players;
      players.forEach(p => {
        const contribution = p.round.get("contribution");
        console.log(`Player ${p.id} contributed: ${contribution}`);

        // Immediately deduct contribution from coins
        const newCoins = p.get("coins") - contribution;
        p.set("coins", newCoins);
        p.round.set("kept", newCoins);

        console.log(`Player ${p.id} kept: ${newCoins}, new balance: ${p.get("coins")}`);
      });

      // Calculate total contribution and store at round level for later use
      const roundContribution = players.reduce((sum, p) => sum + p.round.get("contribution"), 0);
      stage.round.set("totalContribution", roundContribution);
      console.log(`Total round contribution: ${roundContribution}`);
      break;

    case "monitor":
      console.log("Distributing public good returns after monitoring...");
      const monitorPlayers = stage.currentGame.players;
      const contributionMultiplier = 2;

      // Get the total contribution from the round data
      const totalContribution = stage.round.get("totalContribution");
      const roundPool = totalContribution * contributionMultiplier;
      const share = roundPool / monitorPlayers.length;

      console.log(`Multiplied pool (x${contributionMultiplier}): ${roundPool}`);
      console.log(`Each player receives: ${share}`);

      monitorPlayers.forEach(p => {
        // Deduct one coin for each player they monitor
        const monitoredPlayers = p.round.get("monitoredPlayers") || [];
        const monitoringCost = monitoredPlayers.length;
        const newTotal = p.get("coins") + share - monitoringCost;

        console.log(
          `Player ${p.id} receives share: ${share}, ` +
          `monitoring cost: ${monitoringCost}, ` +
          `new balance: ${newTotal}`
        );

        p.round.set("share", share);
        p.set("coins", newTotal);

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

    case "result":
      console.log("Players have viewed results...");
      break;
  }
});

// Round End
Empirica.onRoundEnded(({ round }) => {
  console.log(`Round ended: ${round.get("name")}`);
  const players = round.currentGame.players;
  players.forEach(p => {
    const coins = p.get("coins");
    const oldPoints = p.get("points") || 0;
    const newPoints = oldPoints + coins;
    p.set("points", newPoints);
    console.log(`Player ${p.id} coins at end of round: ${coins}`);
    console.log(`Player ${p.id} points at end of round: ${p.get("points") || 0}`);
  });
});

// Game End
Empirica.onGameEnded(({ game }) => {
  console.log("Game ended");
  const players = game.players;
  players.forEach(p => {
    const finalCoins = p.get("coins");
    console.log(`Player ${p.id} final coins: ${finalCoins}`);
  });
});
