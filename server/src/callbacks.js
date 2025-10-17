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
      console.log("[StageEnd] Processing punishment...");
      console.log("---------- Building punishment matrix...");
      players.forEach((p) => {
        console.log(`[Punish Debug] ${p.get("name")} penaltyMap:`, p.get("penaltyMap"));
      });

      const punishMatrix = buildMatrix(players, "penaltyMap");
      round.set("punishMatrix", punishMatrix);
      printMatrix(punishMatrix, players, "Punishment Matrix");
      players.forEach((p) => {
        const punishCost = Number(p.round.get("punishCost") || 0);
        const punishReceived = Object.entries(punishMatrix).reduce((sum, [sid, penalties]) =>
          sum + PUNISH_MULTIPLIER * (penalties[p.id] || 0), 0);
        p.round.set("punishReceived", punishReceived);
        const currentTokens = Number(p.get("tokens") || 0);
        const newTokens = Math.max(0, currentTokens - punishReceived - punishCost);
        p.set("tokens", newTokens);
        console.log(`[StageEnd] Player ${p.get("name")} now has ${newTokens} tokens`);
      });
      break;
    }

    case "transfer": {
      console.log("[StageEnd] Processing transfers...");
      console.log("---------- Building transfer matrix...");
      players.forEach((p) => {
        console.log(`[Transfer Debug] ${p.get("name")} transferMap:`, p.get("transferMapx"));
      });

      const transferMatrix = buildMatrix(players, "transferMap");
      round.set("transferMatrix", transferMatrix);
      printMatrix(transferMatrix, players, "Transfer Matrix");
      players.forEach(p => {
        const transferSent = Object.values(transferMatrix[p.id]).reduce((a, b) => a + b, 0);
        const transferReceived = players.reduce((sum, other) => sum + transferMatrix[other.id][p.id], 0);
        p.round.set("transfersSent", transferSent);
        p.round.set("transfersReceived", transferReceived);
        p.round.set("netTransfer", transferReceived - transferSent);
        const currentTokens = Number(p.get("tokens") || 0);
        const newTokens = Math.max(0, currentTokens + transferReceived - transferSent);
        p.set("tokens", newTokens);
        console.log(
          `[StageEnd] Player ${p.get("name")} now has ${newTokens} tokens `
        );
      });
      break;
    }

    case "credits": {
      console.log("[StageEnd] Credits stage completed (no token changes here).");
      players.forEach(p => {
        const endRoundTokens = p.get("tokens") || 0;
        const prevPoints = p.get("points") || 0;
        const newPoints = prevPoints + endRoundTokens;
        console.log(
          `[StageEnd] Player ${p.get("name")} ended the round with ${endRoundTokens} tokens.` +
          `Previously, they had ${prevPoints} points, which will shortly be updated to ${newPoints} points.`
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


function buildMatrix(players, field) {
  const ids = players.map((p) => p.id);
  const matrix = {};
  ids.forEach((sender) => {
    matrix[sender] = {};
    ids.forEach((receiver) => {
      matrix[sender][receiver] = 0;
    });
  });
  players.forEach((sender) => {
    const raw = sender.get(field);
    const map = (raw && typeof raw === "object") ? raw : {};
    players.forEach((receiver) => {
      matrix[sender.id][receiver.id] = map[receiver.id] || 0;
    });
  });
  return matrix;
}

function printMatrix(matrix, players, label = "Matrix") {
  const ids = players.map((p) => p.id);
  const names = players.map((p) => p.get("name") || p.id);
  const header = ["From→To", ...names];
  const rows = ids.map((sid, i) => [
    names[i],
    ...ids.map((rid) => matrix[sid][rid]),
  ]);
  console.log(`\n=== ${label} ===`);

    const colWidths = header.map((_, colIndex) =>
    Math.max(
      header[colIndex].length,
      ...rows.map((r) => String(r[colIndex]).length)
    )
  );

  const formatRow = (row) =>
    row.map((val, i) => String(val).padEnd(colWidths[i] + 2)).join("");

  console.log(formatRow(header));
  rows.forEach((r) => console.log(formatRow(r)));
  console.log("======================================\n");
}
