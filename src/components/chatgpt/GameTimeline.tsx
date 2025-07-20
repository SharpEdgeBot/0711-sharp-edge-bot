"use client";
import React from "react";

const mockEvents = [
  { time: "1st Inning", desc: "Home run by Judge" },
  { time: "3rd Inning", desc: "Double by Ohtani" },
  { time: "5th Inning", desc: "Pitching change" },
  { time: "7th Inning", desc: "Bases loaded" },
  { time: "9th Inning", desc: "Walk-off single" },
];

const GameTimeline: React.FC<{ events?: Array<{ time: string; desc: string }> }> = ({ events = mockEvents }) => (
  <div className="bg-[#23272f] rounded-2xl p-4 shadow-lg mb-4">
    <h3 className="font-bold text-lg text-white mb-2">Game Timeline</h3>
    <ul className="flex flex-col gap-2">
      {events.map((ev, idx) => (
        <li key={idx} className="flex gap-2 items-center">
          <span className="font-mono text-xs text-[#00d4ff] w-24">{ev.time}</span>
          <span className="text-white">{ev.desc}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default GameTimeline;
