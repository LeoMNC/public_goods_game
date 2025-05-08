import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();

Empirica.onGameStart(({ game }) => {
  const treatment = game.get("treatment");
  const { numRounds } = treatment;
  for (let i = 0; i < numRounds; i++) {
    const round = game.addRound({
      name: `Round ${i}`,
    });
    round.addStage({ name: "choice", duration: 10000 });
    round.addStage({ name: "result", duration: 10000 });
  }
});

Empirica.onRoundStart(({ round }) => {
  const players = round.currentGame.players;
  players.forEach(p => {
    p.set("tokens", 10);
    p.round.set("contribution", 0);
    p.round.set("kept", 0);
  });
});

Empirica.onStageStart(({ stage }) => {});

Empirica.onStageEnded(({ stage }) => {
  if (stage.get("name") !== "choice") return;
  console.log("End of choice stage");

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
  
  console.log(`Round contribution: ${roundContribution}`);
  console.log(`Multiplied pool: ${roundPool}`);
  console.log(`Each player receives from pool: ${share}`);
   
  players.forEach(p => {
    const contribution = p.round.get("contribution");
    const kept = p.get("tokens") - contribution;
    p.round.set("share",share);
    const totalEarnings = kept + share;
    console.log(`Player ${p.id} kept: ${kept}, total earnings after this round: ${totalEarnings}`);
    p.set("tokens", kept + share);
  });
});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});
