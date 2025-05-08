import React from "react";

export function Avatar({ player }) {
  return (
    <img
      className="h-full w-full rounded-md shadow bg-white p-1"
      src={`https://upload.wikimedia.org/wikipedia/en/5/51/UC_Merced_Seal.png`}
      alt="Avatar"
    />
  );
}
