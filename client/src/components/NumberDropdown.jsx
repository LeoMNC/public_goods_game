import React from "react";
import { useState } from "react";

export function NumberDropdown({ maxNumber }) {
  const [selectedNumber, setSelectedNumber] = useState("");

  return (
    <div className="m-5">
      <select
        className="border rounded p-2"
        value={selectedNumber}
        onChange={(e) => setSelectedNumber(e.target.value)}
      >
        <option value="">Select a number</option>
        {[...Array(maxNumber).keys()].map((num) => (
          <option key={num + 1} value={num + 1}>
            {num + 1}
          </option>
        ))}
      </select>
    </div>
  );
}
