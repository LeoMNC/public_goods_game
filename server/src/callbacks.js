// server/src/callbacks.js
import { ClassicListenersCollector } from "@empirica/core/admin/classic";
export const Empirica = new ClassicListenersCollector();

import path from "path"; // ensure path is imported for the init handler

const numPracticeRounds = 1;           // Optional practice round
const PUNISH_MULTIPLIER = 5;
const CONTRIBUTION_MULTIPLIER = 2;
const initialTokens = 10;               // Initial tokens per player
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
  const playDuration = treatment.playDuration || 30;
  const talkDuration = treatment.talkDuration || 60;

  for (let i = 1; i <= (numRounds + numPracticeRounds); i++) {
    console.log(`[GameStart] Creating Round ${i}`);
    const round = game.addRound({ name: `Round ${i}` });
    round.set("isPractice", i <= numPracticeRounds);
    stageNames.forEach((stageName) => {
      let roundDuration = (stageName === "credits") ? talkDuration : playDuration; // was const; needs let to adjust
      if (round.get("isPractice")) { roundDuration = roundDuration + 60; }
      round.addStage({
        name: stageName,
        duration: roundDuration,
      });
      console.log(`[GameStart] Round ${i}, stage ${stageName} created`);
    });
    console.log(`[GameStart] Round ${i} finalized`);
  }
});

// Round Start: initialize tokens and round properties
Empirica.onRoundStart(({ round }) => {
  console.log(`[RoundStart] Round started: ${round.get("name")}`);
  const players = round.currentGame.players;
  players.forEach((p) => {
    p.set("tokens", initialTokens);
    p.round.set("monitoredPlayers", []);
    p.round.set("transfersSent", 0);
    p.round.set("transfersReceived", 0);
    p.round.set("contribution", 0);
    p.round.set("kept", 0);
    p.round.set("givenPunishments", []);
    p.round.set("punishmentReceived", 0);
    console.log(
      `[RoundStart] Player ${p.get("name")} balance reset to ${initialTokens} tokens for new round.`
    );
  });
});

// Stage Start (no token mutations here anymore)
Empirica.onStageStart(({ stage }) => {
  console.log(`[StageTrack] Stage started: ${stage.get("name")}`);
  // Intentionally no token updates here; all updates occur at the end of each stage.
});

// Stage End
Empirica.onStageEnded(({ stage }) => {
  const stageName = stage.get("name");
  const round = stage.round;
  const roundName = round.get("name");
  console.log(`[StageTrack] Stage ended: ${stageName} in ${roundName}`);
  const players = round.currentGame.players;

  switch (stageName) {
    case "contribution": {
      console.log("[StageEnd] Processing contributions...");
      // 1) Deduct individual contributions & set 'kept'
      players.forEach(p => {
        const contribution = Number(p.round.get("contribution") || 0);
        const currentTokens = Number(p.get("tokens") || 0);
        const postContributionTokens = Math.max(0, currentTokens - contribution);
        p.set("tokens", postContributionTokens);
        p.round.set("kept", postContributionTokens);
        console.log(
          `[StageEnd] Player ${p.get("name")} contributed: ${contribution}, ` +
          `new balance: ${postContributionTokens}`
        );
      });

      // 2) Compute pool & per-player share
      const roundContribution = players.reduce(
        (sum, p) => sum + Number(p.round.get("contribution") || 0), 0
      );
      round.set("totalContribution", roundContribution);

      const roundPool = roundContribution * CONTRIBUTION_MULTIPLIER;
      const share = (players.length > 0 ? roundPool / players.length : 0);
      round.set("share", share); // keep numeric; format toFixed() only for display

      console.log(`[StageEnd] Total round contribution: ${roundContribution}`);
      console.log(`[StageEnd] Multiplied pool (x${CONTRIBUTION_MULTIPLIER}): ${roundPool}`);
      console.log(`[StageEnd] Each player will receive ${share} from the pool`);

      // 3) CREDIT the share immediately (moved from credits stage)
      players.forEach(p => {
        const currentTokens = Number(p.get("tokens") || 0);
        const newTokens = currentTokens + share;
        p.set("tokens", newTokens);
        console.log(`[StageEnd] Player ${p.get("name")} received share now: +${share}, tokens: ${newTokens}`);
      });
      break;
    }

    case "monitor": {
      console.log("[StageEnd] Processing monitoring...");
      players.forEach(p => {
        const monitoredPlayers = p.round.get("monitoredPlayers") || [];
        const monitoringCost = Number(p.round.get("monitoringCost") || 0);

        console.log(
          `[StageEnd] Player ${p.get("name")} monitored ${monitoredPlayers.length} players, cost: ${monitoringCost}`
        );

        const monitoringResults = monitoredPlayers.map(monitoredId => {
          const mp = players.find(x => x.id === monitoredId);
          return mp ? {
            id: mp.id,
            contribution: Number(mp.round.get("contribution") || 0),
            kept: Number(mp.round.get("kept") || 0)
          } : null;
        }).filter(Boolean);

        p.round.set("monitoringResults", monitoringResults);
        p.round.set("monitoringCost", monitoringCost);

        // Deduct monitoring cost NOW
        const currentTokens = Number(p.get("tokens") || 0);
        const newTokens = Math.max(0, currentTokens - monitoringCost);
        p.set("tokens", newTokens);
        console.log(
          `[StageEnd] Player ${p.get("name")} paid monitoring cost: -${monitoringCost}, new balance: ${newTokens}`
        );
      });
      break;
    }

    case "intermission": {
      console.log("[StageEnd] Intermission stage completed");
      break;
    }

    case "punish": {
      console.log("[StageEnd] Processing punishment (costs + targets)...");
      // 1) Deduct punisher costs (already in your code)
      players.forEach((p) => {
        const given = p.round.get("givenPunishments") || [];
        const punishCost = Number(p.round.get("punishCost") ?? given.length);
        const currentTokens = Number(p.get("tokens") || 0);
        const newTokens = Math.max(0, currentTokens - punishCost);
        p.set("tokens", newTokens);
        p.round.set("punishCost", punishCost);
        console.log(
          `[StageEnd] Player ${p.get("name")} punished ${given.length} player${given.length !== 1 ? "s" : ""}, ` +
          `cost: ${punishCost}, new balance: ${newTokens}`
        );
      });

      const punishmentTotals = {};
      players.forEach(p => { punishmentTotals[p.id] = 0; });
      players.forEach(punisher => {
        const penaltyMap = punisher.round.get("penaltyMap") || {};
        for (const [targetId, amountRaw] of Object.entries(penaltyMap)) {
          const amount = Number(amountRaw) || 0;
          const penalty = amount * PUNISH_MULTIPLIER;
          if (punishmentTotals[targetId] !== undefined) {
            punishmentTotals[targetId] += penalty;
          }
        }
      }
    );
      players.forEach(p => {
        const punishment = Number(punishmentTotals[p.id] || 0);
        p.round.set("punishmentReceived", punishment);
        if (punishment > 0) {
          const currentTokens = Number(p.get("tokens") || 0);
          const newTokens = Math.max(0, currentTokens - punishment);
          p.set("tokens", newTokens);
          console.log(
            `[StageEnd] Player ${p.get("name")} punished now: -${punishment}, new tokens: ${newTokens}`
          );
        } else {
          console.log(`[StageEnd] Player ${p.get("name")} received no punishment.`);
        }
      });
      break;
    }

    case "transfer": {
      console.log("[StageEnd] Processing transfers...");
      // 1) Deduct senders
      const aggregateReceived = {};
      players.forEach((p) => (aggregateReceived[p.id] = 0));

      players.forEach((sender) => {
        const map = sender.round.get("transferMap") || {};
        const sent = Object.values(map).reduce((s, v) => s + Number(v || 0), 0);
        const currentTokens = Number(sender.get("tokens") || 0);
        const postTransferSentTokens = Math.max(0, currentTokens - sent);
        sender.set("tokens", postTransferSentTokens);
        for (const [rid, amtRaw] of Object.entries(map)) {
          const amt = Number(amtRaw) || 0;
          if (aggregateReceived[rid] != null) aggregateReceived[rid] += amt;
        }

        if (sent > 0) {
          console.log(
            `[StageEnd] Player ${sender.get("name")} sent ${sent} token${sent !== 1 ? "s" : ""}`
          );
        }
      });
      players.forEach((recipient) => {
        const receivedThusFar = aggregateReceived[recipient.id] || 0;
        recipient.round.set("transfersReceived", receivedThusFar);
        if (receivedThusFar > 0) {
          const currentTokens = Number(recipient.get("tokens") || 0);
          const newTokens = currentTokens + receivedThusFar;
          recipient.set("tokens", newTokens);
          console.log(
            `[StageEnd] Player ${recipient.get("name")} received ${receivedThusFar} transfer` +
            `${receivedThusFar !== 1 ? "s" : ""}`
          );
        }
      });
      break;
    }

    case "credits": {
      console.log("[StageEnd] Credits stage completed (no token changes here).");
      players.forEach(p => {
        console.log(
          `[StageEnd] Player ${p.get("name")} - Tokens: ${p.get("tokens")}, Points: ${p.get("points") || 0}`
        );
      });
      break;
    }

    default: {
      console.warn(`[StageEnd] Unhandled stage: ${stageName}`);
      break;
    }
  }
});

// Round End
Empirica.onRoundEnded(({ round }) => {
  console.log(`[RoundEnd] Round ended: ${round.get("name")}`);
  const players = round.currentGame.players;
  players.forEach(p => {
    const tokens = Number(p.get("tokens") || 0);
    const oldPoints = Number(p.get("points") || 0);
    const newPoints = oldPoints + tokens;
    p.set("points", newPoints);
    console.log(
      `[RoundEnd] Player ${p.get("name")} tokens: ${tokens}, points: ${oldPoints} → ${newPoints}`
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

// **Serve React for non-Empirica routes**
Empirica.on("init", ({ server }) => {
  server.app.get("*", (req, res, next) => {
    if (req.path.startsWith("/query") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.resolve(__dirname, "../../client/build/index.html"));
  });
});
