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
    //"transfer",
    "credits"];
  
  for (let i = 0; i < numRounds; i++) {
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
      const contributionMultiplier = 1.5;
      let roundContribution = 0;

      players.forEach(p => {
        const contribution = p.round.get("contribution");
        console.log(`Player ${p.id} contributed: ${contribution}`);
        roundContribution += contribution;
      });

      const roundPool = roundContribution * contributionMultiplier;
      const share = roundPool / players.length;

      console.log(`Total round contribution: ${roundContribution}`);
      console.log(`Multiplied pool (x${contributionMultiplier}): ${roundPool}`);
      console.log(`Each player receives: ${share}`);

      players.forEach(p => {
        const contribution = p.round.get("contribution");
        const kept = p.get("coins") - contribution;
        const totalEarnings = kept + share;

        console.log(
          `Player ${p.id} kept: ${kept}, receives share: ${share}, ` +
          `total earnings this round: ${totalEarnings}`
        );

        p.round.set("share", share);
        p.set("coins", totalEarnings);
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
    console.log(`Player ${p.id} coins at end of round: ${coins}`);
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
