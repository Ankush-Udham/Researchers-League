import { useEffect, useState } from "react";
import api from "../lib/api";
import { PageHead } from "../components/shared";
import { useSettings } from "../context/SettingsContext";

cexport default function Rankings() {
  const { SPORTS, TEAM_COLOR } = useSettings();
  const TABS = { OVERALL: "Overall", ...SPORTS };

  const [data, setData] = useState(null);
  const [tab, setTab] = useState("OVERALL");
  // ...rest of the function

const Table = ({ rows, TEAM_COLOR }) => (
  <div className="overflow-x-auto border border-white/10 rounded-xl" data-testid="standings-table">
    <table className="w-full text-sm min-w-[520px]">
      <thead className="bg-[#1F1F1F] text-zinc-400 label-tag text-xs">
        <tr>
          <th className="text-left p-4">#</th><th className="text-left p-4">Team</th>
          <th className="p-4">P</th><th className="p-4">W</th><th className="p-4">L</th>
          <th className="p-4">PF</th><th className="p-4">PA</th><th className="p-4">Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.team} className="border-t border-white/10 hover:bg-white/5" data-testid={`standing-${r.team.replace(/\s/g, "")}`}>
            <td className="p-4 font-display text-lg">{i + 1}</td>
            <td className="p-4 font-semibold" style={{ color: TEAM_COLOR[r.team] }}>{r.team}</td>
            <td className="p-4 text-center">{r.played}</td>
            <td className="p-4 text-center text-[#22C55E]">{r.won}</td>
            <td className="p-4 text-center text-[#FF3B30]">{r.lost}</td>
            <td className="p-4 text-center">{r.pf}</td>
            <td className="p-4 text-center">{r.pa}</td>
            <td className="p-4 text-center font-display text-xl">{r.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function Rankings() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("OVERALL");
  useEffect(() => { api.get("/standings").then((r) => setData(r.data)).catch(() => {}); }, []);

  return (
    <div className="min-h-screen">
      <PageHead label="Stats & Rankings" title="STANDINGS" accent="#22C55E" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(TABS).map(([k, v]) => (
            <button key={k} data-testid={`rtab-${k}`} onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${tab === k ? "bg-[#22C55E] border-[#22C55E] text-black" : "border-white/15 text-zinc-300 hover:border-white/40"}`}>{v}</button>
          ))}
        </div>
        {data ? <Table rows={data[tab]} /> : <p className="text-zinc-500">Loading standings...</p>}
        <p className="text-xs text-zinc-500 mt-4">Win = 3 pts · Draw = 1 pt · Loss = 0. PF/PA = points for/against. Standings update automatically as results are entered.</p>
      </div>
    </div>
  );
}
