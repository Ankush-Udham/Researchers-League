import { useEffect, useState } from "react";
import api from "../lib/api";
import { PageHead } from "../components/shared";
import { useSettings } from "../context/SettingsContext";

export default function History() {
  const { TEAM_COLOR } = useSettings();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/history").then(r => setHistory(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <PageHead label="League Archives" title="HISTORY" accent="#8B5CF6" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-12">
        {history.length === 0 ? (
          <p className="text-zinc-500 text-center py-10">No past tournaments have been archived yet.</p>
        ) : history.slice().reverse().map(tourney => (
          <div key={tourney.id} className="card-tech rounded-2xl p-6 sm:p-8 border border-white/10 animate-fade-in-up">
            
            {/* Archive Header */}
            <div className="border-b border-white/10 pb-4 mb-8">
              <h3 className="font-display text-4xl text-white tracking-wide">{tourney.name}</h3>
              <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest">Archived on {tourney.date}</p>
            </div>

            {/* Archived Overall Standings */}
            <h4 className="font-semibold text-lg text-[#8B5CF6] mb-4">Final Overall Standings</h4>
            <div className="overflow-x-auto mb-10 bg-[#0A0A0A] rounded-xl border border-white/10 shadow-inner">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-white/5">
                    <th className="p-4 font-semibold">Pos</th>
                    <th className="p-4 font-semibold">Team</th>
                    <th className="p-4 font-semibold text-center">W</th>
                    <th className="p-4 font-semibold text-center">L</th>
                    <th className="p-4 font-semibold text-center text-[#8B5CF6]">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tourney.standings?.map((row, i) => (
                    <tr key={row.team} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-display text-xl text-zinc-600">{i + 1}</td>
                      <td className="p-4 font-bold text-lg" style={{ color: TEAM_COLOR?.[row.team] || "#FFF" }}>{row.team}</td>
                      <td className="p-4 text-center text-zinc-300">{row.won}</td>
                      <td className="p-4 text-center text-zinc-300">{row.lost}</td>
                      <td className="p-4 text-center font-display text-2xl text-[#8B5CF6]">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Archived Team Rosters */}
            <h4 className="font-semibold text-lg text-[#8B5CF6] mb-4">Official Team Rosters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tourney.teams || {}).map(([teamName, players]) => (
                <div key={teamName} className="bg-[#141414] p-5 rounded-xl border border-white/5">
                  <h5 className="font-bold text-lg mb-3 border-b border-white/10 pb-2" style={{ color: TEAM_COLOR?.[teamName] || "#FFF" }}>{teamName}</h5>
                  <ul className="space-y-2">
                    {players.length === 0 ? <li className="text-xs text-zinc-600 italic">No players assigned</li> : players.map(p => (
                      <li key={p.number} className="text-sm text-zinc-300 flex justify-between items-center">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-zinc-600 text-xs bg-white/5 px-2 py-0.5 rounded">#{p.number}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
