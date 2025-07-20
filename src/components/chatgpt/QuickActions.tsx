"use client";
import React from "react";

const actions = [
  "Analyze recent performance",
  "Compare two players",
  "Predict game outcome",
  "Explain play/strategy",
  "Season recap & predictions",
];

const QuickActions: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => (
  <div className="flex gap-2 mb-4 flex-wrap">
    {actions.map(action => (
      <button
        key={action}
        className="px-3 py-2 rounded-xl font-bold text-xs shadow-md bg-[#00d4ff] text-[#181a1a] hover:bg-[#39ff14] transition-colors"
        onClick={() => onAction(action)}
      >
        {action}
      </button>
    ))}
  </div>
);

export default QuickActions;
