"use client";
import React from "react";

const sports = ["MLB", "NBA", "NFL", "NHL", "Soccer"];

const SportsSelector: React.FC<{ value: string; onChange: (sport: string) => void }> = ({ value, onChange }) => (
  <select
    className="bg-[#23272f] text-[#00d4ff] border border-[#00d4ff] rounded-xl px-4 py-2 font-bold"
    value={value}
    onChange={e => onChange(e.target.value)}
    aria-label="Select sport"
  >
    {sports.map(sport => (
      <option key={sport} value={sport}>{sport}</option>
    ))}
  </select>
);

export default SportsSelector;
