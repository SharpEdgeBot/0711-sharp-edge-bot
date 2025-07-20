"use client";
import React, { useState } from "react";

const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#23272f] rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-[#00d4ff] mb-4">Settings</h2>
        {/* Add theme, favorite teams, notification preferences here */}
        <button className="mt-6 px-4 py-2 rounded-xl bg-[#00d4ff] text-white font-bold" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SettingsModal;
