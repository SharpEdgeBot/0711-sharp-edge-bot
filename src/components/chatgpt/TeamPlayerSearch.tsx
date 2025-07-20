"use client";
import React, { useState } from "react";

const mockTeams = ["Astros", "Mariners", "Twins", "Rockies", "Rangers", "Tigers"];
const mockPlayers = ["Aaron Judge", "Shohei Ohtani", "Jacob Latz", "Tarik Skubal"];

const TeamPlayerSearch: React.FC<{ onSelect: (type: "team" | "player", name: string) => void }> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [type, setType] = useState<"team" | "player">("team");

  const handleSearch = (q: string) => {
    setQuery(q);
    if (type === "team") {
      setResults(mockTeams.filter(t => t.toLowerCase().includes(q.toLowerCase())));
    } else {
      setResults(mockPlayers.filter(p => p.toLowerCase().includes(q.toLowerCase())));
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        <button className={`px-3 py-1 rounded-xl font-bold ${type === "team" ? "bg-[#00d4ff] text-[#181a1a]" : "bg-[#23272f] text-white"}`} onClick={() => setType("team")}>Team</button>
        <button className={`px-3 py-1 rounded-xl font-bold ${type === "player" ? "bg-[#39ff14] text-[#181a1a]" : "bg-[#23272f] text-white"}`} onClick={() => setType("player")}>Player</button>
      </div>
      <input
        className="w-full bg-[#23272f] text-white rounded-xl px-3 py-2 border border-[#00d4ff] mb-2"
        placeholder={`Search ${type}s...`}
        value={query}
        onChange={e => handleSearch(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        {results.map(name => (
          <button key={name} className="text-left px-3 py-1 rounded-xl bg-[#181a1a] text-white hover:bg-[#00d4ff]" onClick={() => onSelect(type, name)}>{name}</button>
        ))}
      </div>
    </div>
  );
};

export default TeamPlayerSearch;
