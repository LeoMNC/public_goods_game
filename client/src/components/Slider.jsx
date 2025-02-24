import React from "react";
import { useState } from "react";
import { usePlayer } from "@empirica/core/player/classic/react";

export function CoinDonationSlider({ min = 0, max = 10, step = 1, className = "", value, onChange }) {
  const [internalValue, setInternalValue] = useState(value ?? min);
  const player = usePlayer(); // Access the player object
  const numCoins = player.round.get("coins");
  const handleChange = (newValue) => {
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue); // Only call if `onChange` is provided
    }
  };

  const handleButtonClick = () => {
    if (player) {
      player.round.set("donation", internalValue); // Save slider value to player object
      player.round.set("coins", (numCoins - internalValue));
      player.stage.set("submit", true);
    }
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        How many coins would you like to donate?
      </h2>
      <div className="relative w-full flex flex-col items-center">
        <span className="absolute -top-6 text-lg font-bold text-empirica-600">
          {internalValue}
        </span>
        <input
          type="range"
          min={min}
          max={numCoins}
          step={step}
          value={internalValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full appearance-none h-2 bg-gray-300 rounded-lg outline-none transition"
        />
        <div className="flex justify-between w-full text-sm text-gray-600 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <button
        onClick={handleButtonClick}
        className="mt-4 px-4 py-2 bg-empirica-600 text-white rounded-lg shadow-md hover:bg-empirica-700 transition"
      >
        Confirm Donation
      </button>
    </div>
  );
}
