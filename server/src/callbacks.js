import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();

///////////////////////////////////////////////////////////////////////////////
// 1) GAME INITIALIZATION: Create rounds and stages
///////////////////////////////////////////////////////////////////////////////
Empirica.onGameStart(({ game }) => {
  // Get treatment parameters with defaults
  const treatment = {
    numRounds: game.get("treatment").numRounds,
    monitorCost: game.get("treatment").monitorCost || 1,
    punishCost: game.get("treatment").punishCost || 1,
    punishPenalty: game.get("treatment").punishPenalty || 3
  };

  const players = game.players;
  console.log("[🎮 Game Start] Treatment Parameters:", treatment);
  console.log("[👥 Players] Initialized with:", players.map(p => p.id));

  // Create game rounds and stages
  for (let i = 0; i < treatment.numRounds; i++) {
    const round = game.addRound({
      name:  `Round ${i + 1}`,
      task:  "public-goods-game"
    });
    
    const stageNames = [
      "contribution",  // Players contribute to public good
      "monitoring",    // Players pay to monitor others
      "intermission",  // Information display (no actions)
      "punishment",    // Players punish others
      "transfer"       // Players transfer coins
    ];
    const stages = [];

    
    console.log(`\n[🔄 Round ${i + 1}] Creating stages...`);
    stageNames.forEach(name => {
      const stage = round.addStage({
        name,
        duration: 10000,
        displayName: name.charAt(0).toUpperCase() + name.slice(1)
      });
      stages.push(stage);
      console.log(`   → Created stage: "${stage.name}"`);
    });
    round.set("stages", stages);
  }
});

///////////////////////////////////////////////////////////////////////////////
// 2) ROUND SETUP: Reset player state for new round
///////////////////////////////////////////////////////////////////////////////
Empirica.onRoundStart(({ round }) => {
  console.log(`\n[🔄 ${round.get("name")}] Starting round`);
  const players = round.currentGame.players;

  players.forEach(player => {
    // Initialize player state
    player.set("coins", 10);  // Reset to starting endowment
    player.round.set("contribution", 0);
    player.round.set("monitored", []);
    player.round.set("punishments", {});
    player.round.set("transfers", {});

    console.log(`[🔄 ${round.get("name")}] Reset ${player.id}: 
      - Coins: 10
      - Contributions: 0
      - Monitoring: []
      - Punishments: {}
      - Transfers: {}`);
  });
});

///////////////////////////////////////////////////////////////////////////////
// 3) STAGE PROCESSING: Handle economic effects between stages
///////////////////////////////////////////////////////////////////////////////
Empirica.onStageStart(({ stage }) => {
  // Get current game state
  const round = stage.round;
  const players = stage.currentGame.players;
  const treatment = stage.currentGame.get("treatment");
  const currentStage = stage.get("name");

  console.log(`\n[📊 ${round.get("name")}] Stage "${currentStage}" starting`);

  // Get previous stage name using stage order
  const stages = stage.round.get("stages");
  const currentIdx = stages.findIndex(s => s.id === stage.id);
  const prevStage = currentIdx > 0 ? stages[currentIdx - 1]?.name : null;

  console.log(`[📊 Stage Flow] Previous stage: ${prevStage || "None"}`);

  // Ensure non-negative coins before stage operations
  players.forEach(p => {
    const currentCoins = Math.max(0, p.get("coins"));
    p.set("coins", currentCoins);
    console.log(`[💰 Coin Check] ${p.id}: ${currentCoins} coins`);
  });

  if (!prevStage) {
    console.log("[⚠️  Stage Flow] No previous stage - skipping effects");
    return;
  }

  // Process previous stage's economic effects
  switch(prevStage) {
    case "contribution":
      console.log("[📥 Contributions] Processing donations...");
      players.forEach(player => {
        const contribution = player.round.get("contribution") || 0;
        const newCoins = Math.max(0, player.get("coins") - contribution);
        player.set("coins", newCoins);
        console.log(`   → ${player.id} contributed ${contribution} (Now: ${newCoins} coins)`);
      });
      break;

    case "monitoring":
      console.log("[👀 Monitoring] Charging observation costs...");
      players.forEach(player => {
        const targets = player.round.get("monitored") || [];
        const cost = targets.length * treatment.monitorCost;
        const newCoins = Math.max(0, player.get("coins") - cost);
        player.set("coins", newCoins);
        console.log(`   → ${player.id} paid ${cost} to monitor ${targets.length} players (Now: ${newCoins} coins)`);
      });
      break;

    case "punishment":
      console.log("[🔨 Punishments] Applying sanctions...");
      players.forEach(punisher => {
        const punishments = punisher.round.get("punishments") || {};
        const punishmentCost = Object.values(punishments).reduce((sum, val) => sum + val, 0) * treatment.punishCost;
        const newCoins = Math.max(0, punisher.get("coins") - punishmentCost);
        punisher.set("coins", newCoins);
        console.log(`   → ${punisher.id} paid ${punishmentCost} in punishment costs (Now: ${newCoins} coins)`);

        // Apply penalties to targets
        Object.entries(punishments).forEach(([targetId, points]) => {
          const target = players.find(p => p.id === targetId);
          if (target) {
            const penalty = points * treatment.punishPenalty;
            const targetNewCoins = Math.max(0, target.get("coins") - penalty);
            target.set("coins", targetNewCoins);
            console.log(`     ⇢ ${target.id} penalized ${penalty} by ${punisher.id} (Now: ${targetNewCoins} coins)`);
          }
        });
      });
      break;

    case "transfer":
      console.log("[💸 Transfers] Processing payments...");
      players.forEach(sender => {
        const transfers = sender.round.get("transfers") || {};
        const totalSent = Object.values(transfers).reduce((sum, val) => sum + val, 0);
        const newCoins = Math.max(0, sender.get("coins") - totalSent);
        sender.set("coins", newCoins);
        console.log(`   → ${sender.id} sent ${totalSent} total (Now: ${newCoins} coins)`);

        // Apply transfers to recipients
        Object.entries(transfers).forEach(([recipientId, amount]) => {
          const recipient = players.find(p => p.id === recipientId);
          if (recipient) {
            const recipientNewCoins = recipient.get("coins") + amount;
            recipient.set("coins", recipientNewCoins);
            console.log(`     ⇢ ${recipient.id} received ${amount} (Now: ${recipientNewCoins} coins)`);
          }
        });
      });
      break;

    default:
      console.log(`[ℹ️  Stage Flow] No processing needed for ${prevStage}`);
  }
});

///////////////////////////////////////////////////////////////////////////////
// 4) ROUND COMPLETION: Calculate and store earnings
///////////////////////////////////////////////////////////////////////////////
Empirica.onRoundEnded(({ game, round }) => {
  console.log(`\n[🏁 ${round.get("name")}] Round ending`);
  const players = round.currentGame.players;

  players.forEach(player => {
    const roundEarnings = player.get("coins");
    const totalEarnings = (player.get("totalEarnings") || 0) + roundEarnings;
    
    // Update earnings history
    const history = player.get("earningsHistory") || [];
    history.push(roundEarnings);
    
    player.set("totalEarnings", totalEarnings);
    player.set("earningsHistory", history);

    console.log(`[💰 Earnings] ${player.id}: 
      - Round: ${roundEarnings}
      - Total: ${totalEarnings}
      - History: [${history.join(", ")}]`);
  });
});

///////////////////////////////////////////////////////////////////////////////
// 5) GAME COMPLETION: Final reporting
///////////////////////////////////////////////////////////////////////////////
Empirica.onGameEnded(({ game }) => {
  console.log("\n[🏁 Game Over] Final Results");
  const players = game.get("players");
  console.log("[📊 Final Balances]");
  players.forEach(player => {
    console.log(`   → ${player.id}: 
      - Coins: ${player.get("coins")}
      - Total Earnings: ${player.get("totalEarnings")}
      - Rounds Played: ${player.get("earningsHistory")?.length || 0}`);
  });
});