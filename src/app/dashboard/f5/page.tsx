import React from 'react';

export default function F5Dashboard() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-black mb-4">First 5 Innings (F5) Dashboard</h1>
      <p className="text-black mb-8">Specialized models and analysis for early-game betting opportunities. All text is black for maximum readability.</p>
      {/* F5 cards or table will go here */}
      <div className="border rounded-lg p-6 bg-white text-black">
        <div className="font-bold mb-2">Sample F5 Table</div>
        <table className="w-full text-black">
          <thead>
            <tr className="border-b">
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
