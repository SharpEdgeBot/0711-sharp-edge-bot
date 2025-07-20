import React from 'react';

export default function YrfiNrfiDashboard() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)] font-sans">
      <h1 className="text-3xl font-bold gradient-text mb-4">YRFI / NRFI Analysis</h1>
      <p className="text-body mb-8">Analyze Yes/No Run First Inning markets using team and pitcher metrics.</p>
      {/* YRFI/NRFI cards or table will go here */}
      <div className="modern-card">
        <div className="font-bold mb-2 gradient-text">Sample YRFI/NRFI Table</div>
        <table className="modern-table">
          <thead>
            <tr>
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
