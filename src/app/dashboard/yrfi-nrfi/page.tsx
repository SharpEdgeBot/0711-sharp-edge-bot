import React from 'react';

export default function YrfiNrfiDashboard() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-black mb-4">YRFI / NRFI Analysis</h1>
      <p className="text-black mb-8">Analyze Yes/No Run First Inning markets using team and pitcher metrics. All text is black for maximum readability.</p>
      {/* YRFI/NRFI cards or table will go here */}
      <div className="border rounded-lg p-6 bg-white text-black">
        <div className="font-bold mb-2">Sample YRFI/NRFI Table</div>
        <table className="w-full text-black">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Game</th>
              <th className="py-2 text-left">YRFI Odds</th>
              <th className="py-2 text-left">NRFI Odds</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Yankees vs Red Sox</td>
              <td>+110</td>
              <td>-130</td>
            </tr>
            <tr>
              <td>Dodgers vs Giants</td>
              <td>+105</td>
              <td>-125</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
