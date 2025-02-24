import React from "react";
import { Button } from "../components/Button";
import SetPlayerName from "../components/SetPlayerName";
import { useState } from "react";
import { usePlayer } from "@empirica/core/player/classic/react";




export function Introduction({ next }) {
  const player = usePlayer();
  //default player coins
  player.round.set("coins", 5);
  const [nameSet, setNameSet] = useState(false);
  return (
    <div className="mt-3 sm:mt-5 p-20">
      <p>
        <strong>1. The goal of the game is to amass as many coins as possible.</strong>
        You do not have to worry about beating the other players, as this is not a competitive game.
        Each player should act to maximize their own coin total, regardless of how this affects the other players.
        You will start with 10 coins.
      </p>

      <p>
        <strong>2.</strong> This game takes place over many rounds. Each round, you and the other players
        will privately make your moves via the Google Form.
      </p>

      <p>
        <strong>3.</strong> The main decision you make each round is how much to contribute to the
        <em>public good</em>. For each coin you contribute, it will be doubled and then evenly distributed among all players, rounded.
      </p>

      <p>
        <strong>4.</strong> There are three other things you can do each round:
      </p>

      <p>
        <strong>4.1</strong> Pay 1 coin to monitor another player. When you monitor another player,
        you will learn how many coins they contributed immediately prior to the following round.
      </p>

      <p>
        <strong>4.2</strong> Pay 1 coin to punish another player. Players who are punished will
        lose 5 coins immediately prior to the following round.
      </p>

      <p>
        <strong>4.3</strong> Transfer up to 5 coins to another player. The other player will
        receive your transfer immediately prior to the following round.
      </p>

      <p>
        <strong>5.</strong> You may not spend more coins than you have. For example, in the first round,
        you cannot contribute more than your initial 10 coins. If you do contribute all 10 coins, you may not
        monitor, punish, or transfer wealth to other players, since you have no more coins.
      </p>

      <p>
        <strong>6.</strong> During each round, you may communicate with other players.
        You can announce specific things like your moves and the results of your monitoring,
        or more generally strategize with other players. You may also lie, and other players may lie to you.
      </p>

      <p>
        <strong>7. Under no circumstances</strong> may you display your screen to another player,
        nor may you show another player your responses on this sheet.
      </p>

      <br />
      <p>
        Please set a name that other players will see:
      </p>

      <div className="p-10">
        {!nameSet ? (
          <SetPlayerName next={() => setNameSet(true)} />
        ) : (
          <h1 className="text-xl font-bold">Welcome to the Game!</h1>
        )}
      </div>

      <Button handleClick={next} autoFocus>
        <p>Next</p>
      </Button>
    </div>
  );
}
