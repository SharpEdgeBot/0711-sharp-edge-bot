"use client";
import React from "react";

const Timestamp: React.FC<{ time: string }> = ({ time }) => (
  <span className="text-xs text-gray-400 ml-2">{time}</span>
);

export default Timestamp;
