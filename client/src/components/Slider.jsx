import React, { useState, useEffect } from "react";
import { usePlayer } from "@empirica/core/player/classic/react";

export function CoinContributionSlider({
  min = 0,
  max = 10,
  step = 1,
  className = ""
}) {
  const player = usePlayer();
  const [internalValue, setInternalValue] = useState(0);
  
  // Debug logging
  console.log("Slider rendered with max:", max, "player coins:", player?.get("coins"));
  
  const handleChange = (newValue) => {
    const value = Math.min(newValue, max);
    setInternalValue(value);
    console.log("Slider value changed to:", value);
  };

  const handleSubmit = () => {
    if (!player) {
      console.error("No player found!");
      return;
    }
    
    console.log("Submitting contribution:", internalValue);
    try {
      player.round.set("contribution", internalValue);
      player.stage.set("submit", true);
    } catch (error) {
      console.error("Error while submitting:", error);
    }
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Current selection: {internalValue} coins
      </h2>
      
      <div className="relative w-full flex flex-col items-center mb-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={internalValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none"
          style={{ height: "8px", background: "#CBD5E0" }}
        />
        
        <div className="flex justify-between w-full text-sm text-gray-600 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        style={{ backgroundColor: "#3182CE", padding: "8px 16px", borderRadius: "8px" }}
      >
        Confirm contribution of {internalValue} coins
      </button>
    </div>
  );
}