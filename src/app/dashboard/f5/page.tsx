import React from 'react';

export default function F5Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)] font-sans">
      <h1 className="text-3xl font-bold gradient-text mb-4">First 5 Innings (F5) Dashboard</h1>
      <p className="text-body mb-8">Specialized models and analysis for early-game betting opportunities.</p>
      {/* F5 cards or table will go here */}
      <div className="modern-card">
        <div className="font-bold mb-2 gradient-text">Sample F5 Table</div>
        <table className="modern-table">
          <thead>
            <tr>
              <th className="py-2 text-left">Game</th>
              <th className="py-2 text-left">F5 Line</th>
              <th className="py-2 text-left">Projected F5 Runs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Yankees vs Red Sox</td>
              <td>Yankees -0.5</td>
              <td>4.2</td>
            </tr>
            <tr>
              <td>Dodgers vs Giants</td>
              <td>Giants +0.5</td>
              <td>3.8</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
