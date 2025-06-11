// client/src/hooks/usePunishment.js
import { usePlayers, usePlayer } from "@empirica/core/player/classic/react";
import { useState, useCallback } from "react";

export function usePunishment() {
  const players = usePlayers();
  const currentPlayer = usePlayer();
  const [punishedIds, setPunishedIds] = useState([]);
  const [error, setError] = useState(null);

  const cost = punishedIds.length;

  const togglePunish = useCallback((playerId) => {
    setPunishedIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  }, []);

  const submitPunishment = useCallback(() => {
    const tokens = currentPlayer.get("tokens") || 0;
    if (tokens < cost) {
      setError(`Not enough tokens. You have ${tokens}, need ${cost}.`);
      return;
    }

    // Write punished player IDs to round var
    currentPlayer.round.set("givenPunishments", punishedIds);

    currentPlayer.stage.set("submit", true);
    setError(null);
  }, [punishedIds, cost, currentPlayer]);

  return {
    players,
    punishedIds,
    error,
    cost,
    togglePunish,
    submitPunishment,
  };
}
