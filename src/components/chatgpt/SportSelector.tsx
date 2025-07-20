"use client";
import React from "react";

const sports = ["MLB", "NBA", "NFL", "NHL", "Soccer"];

const SportSelector: React.FC<{ value: string; onChange: (sport: string) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-2 mb-4">
    <label className="text-white font-bold">Sport:</label>
    <select
      className="bg-[#23272f] text-white rounded-xl px-3 py-2 border border-[#00d4ff]"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {sports.map(sport => (
        <option key={sport} value={sport}>{sport}</option>
      ))}
    </select>
  </div>
);

export default SportSelector;
