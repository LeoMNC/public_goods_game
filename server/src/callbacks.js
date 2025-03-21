import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();

Empirica.onGameStart(({ game }) => {
  const treatment = game.get("treatment");
  const { numRounds } = treatment;


  const players = game.players;
  console.log("more players", players);
  for (const player of players) {
    player.set("coins", 5)
  }

  for (let i = 0; i < treatment.numRounds; i++) {
    const round = game.addRound({
      name: `Round ${i + 1}`,
    });
    round.addStage({ name: "choice", duration: 10000 });
    //round.addStage({ name: "monitor", duration: 10000 });
    //round.addStage({ name: "transfer", duration: 10000 });
    //round.addStage({ name: "punish", duration: 10000 });
    round.addStage({ name: "result", duration: 10000 });
  }
});

Empirica.onRoundStart(({ round }) => { });

Empirica.onStageStart(({ stage }) => {
  console.log(stage.get("name"));
  if (stage.get("name") === "result") {
    console.log("this one!");
    const players = stage.currentGame.players;

    //Calculate the overall pool contribution
    var total_contribution = 0;
    for (const player of players) {
      total_contribution += player.round.get("donation");
      player.set("last_round_contribution", player.round.get("donation"));
    }

    //calculate how many coins are redistributed to each player
    const profit_per_player = (total_contribution * 2) / players.length;

    //add this amount to the player's purse
    for (const player of players) {
      //let coins;
      const coins = player.get("coins") || 0;
      player.set("coins", coins + profit_per_player);
      player.round.set("share", profit_per_player);
      player.set("last_coin_pool", total_contribution);
    }
    //console.log(`You donated: {player.round.get("donation")`);
    //<p>{`The pool donated: ${totalCoins}`}</p>
    //<p>{`You receive: ${share} coins!`}</p>
    console.log("share: ", profit_per_player);
    console.log("total_contribution: ", total_contribution);




  }
});

Empirica.onStageEnded(({ stage }) => {
  console.log("floop");
  console.log(stage.get("name"));
  /* const players = stage.currentGame.players;

  //const players = game.players;
  console.log("more players", players);


  //Calculate the overall pool contribution
  var total_contribution = 0;
  for (const player of players) {
    total_contribution += player.get("contribution")
  }

  //calculate how many coins are redistributed to each player
  const profit_per_player = (total_contribution * 2) / players.length;

  //add this amount to the player's purse
  for (const player of players) {
    let coins;
    const currentScore = player.get("coins") || 0;
    player.set("coins", coins + profit_per_player);
    player.set("share", profit_per_player);
  } */

  //console.log("more players", players);

});

Empirica.onRoundEnded(({ round }) => {  //compute our score.
  /*   const players = stage.currentGame.players;
  
    //const players = game.players;
    console.log("more players", players);
  
  
    //Calculate the overall pool contribution
    var total_contribution = 0;
    for (const player of players) {
      total_contribution += player.get("contribution")
    }
  
    //calculate how many coins are redistributed to each player
    const profit_per_player = (total_contribution * 2) / players.length;
  
    //add this amount to the player's purse
    for (const player of players) {
      let coins;
      const currentScore = player.get("coins") || 0;
      player.set("coins", coins + profit_per_player);
      player.set("share", profit_per_player);
    }
  
    //console.log("more players", players); */
});

Empirica.onGameEnded(({ game }) => { });
