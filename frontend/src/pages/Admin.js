import { useEffect, useRef, useState } from "react";
import api, { fileUrl } from "../lib/api";
import { useSettings } from "../context/SettingsContext";
import { PageHead } from "../components/shared";
import { toast } from "sonner";
import { Save, Plus, Trash2, Upload } from "lucide-react";

const TABS = ["Branding", "League Config", "Players", "News", "Developer", "History"];

const ImgUpload = ({ label, value, onChange, testid }) => {
  const ref = useRef();
  const up = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData(); fd.append("file", f);
    try {
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(data.storage_path); toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
  };
  const src = value ? (value.startsWith("http") ? value : fileUrl(value)) : null;
  return (
    <div className="flex items-center gap-4">
      {src && <img src={src} alt="" className="h-16 w-16 rounded-lg object-cover border border-white/15" />}
      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 cursor-pointer hover:border-white/40 text-sm" data-testid={testid}>
        <Upload size={15} /> {label}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={up} />
      </label>
    </div>
  );
};

export default function Admin() {
  const { settings, refresh } = useSettings();
  const [tab, setTab] = useState("Branding");
  const [form, setForm] = useState({});
  const [players, setPlayers] = useState([]);
  const [news, setNews] = useState([]);
  const [newNews, setNewNews] = useState({ title: "", body: "" });
  const [hist, setHist] = useState([]);

  useEffect(() => { if (settings) { setForm(settings); setHist(settings.history || []); } }, [settings]);
  useEffect(() => {
    api.get("/players").then((r) => setPlayers(r.data));
    api.get("/news").then((r) => setNews(r.data));
  }, []);

  const saveSettings = async (extra = {}) => {
    try {
      await api.put("/settings", { ...form, ...extra });
      toast.success("Saved"); refresh();
    } catch { toast.error("Save failed"); }
  };

  const savePlayer = async (p) => {
    try {
      await api.put(`/players/${p.id}`, { number: Number(p.number), name: p.name, team: p.team, role: p.role, bio: p.bio, photo_url: p.photo_url });
      toast.success("Player saved");
    } catch { toast.error("Failed"); }
  };

  const addNews = async () => {
    if (!newNews.title) return;
    try { await api.post("/news", newNews); setNewNews({ title: "", body: "" }); api.get("/news").then((r) => setNews(r.data)); toast.success("Posted"); }
    catch { toast.error("Failed"); }
  };
  const delNews = async (id) => { await api.delete(`/news/${id}`); api.get("/news").then((r) => setNews(r.data)); };

  return (
    <div className="min-h-screen">
      <PageHead label="Admin Panel" title="MANAGE LEAGUE" accent="#FF3B30" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} data-testid={`admin-tab-${t}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${tab === t ? "bg-[#FF3B30] border-[#FF3B30]" : "border-white/15 text-zinc-300 hover:border-white/40"}`}>{t}</button>
          ))}
        </div>

        {tab === "Branding" && (
          <div className="card-tech rounded-xl p-6 space-y-4" data-testid="admin-branding">
            <label className="block text-sm text-zinc-400">League Name
              <input value={form.league_name || ""} onChange={(e) => setForm({ ...form, league_name: e.target.value })} className="w-full mt-1 bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 text-white" data-testid="branding-name" /></label>
            <label className="block text-sm text-zinc-400">Tagline
              <input value={form.tagline || ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full mt-1 bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 text-white" data-testid="branding-tagline" /></label>
            <div><span className="text-sm text-zinc-400 block mb-2">League Logo</span>
              <ImgUpload label="Upload Logo" value={form.logo_url} onChange={(v) => { setForm({ ...form, logo_url: v }); saveSettings({ logo_url: v }); }} testid="branding-logo-upload" /></div>
            <button onClick={() => saveSettings()} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF3B30] font-semibold" data-testid="branding-save"><Save size={16} /> Save</button>
          </div>
        )}
        {tab === "League Config" && (
          <div className="space-y-6" data-testid="admin-league">
            {/* Teams Manager */}
            <div className="card-tech rounded-xl p-6 space-y-4">
              <h3 className="font-display text-2xl text-[#FF3B30]">Manage Teams</h3>
              {(form.teams || []).map((t, i) => (
                <div key={i} className="flex gap-3">
                  <input value={t.name} onChange={(e) => { const c = [...form.teams]; c[i].name = e.target.value; setForm({ ...form, teams: c }); }} className="flex-1 bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" placeholder="Team Name" />
                  <input type="color" value={t.color} onChange={(e) => { const c = [...form.teams]; c[i].color = e.target.value; setForm({ ...form, teams: c }); }} className="h-10 w-14 rounded-lg cursor-pointer bg-transparent border-0" />
                  <button onClick={() => { const c = form.teams.filter((_, x) => x !== i); setForm({ ...form, teams: c }); }} className="text-[#FF3B30]"><Trash2 size={18} /></button>
                </div>
              ))}
              <button onClick={() => setForm({ ...form, teams: [...(form.teams || []), { name: "New Team", color: "#FFFFFF" }] })} className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-white/15 hover:border-white/40"><Plus size={15} /> Add Team</button>
            </div>

            {/* Match Constraints */}
            <div className="card-tech rounded-xl p-6">
               <h3 className="font-display text-2xl text-[#007AFF] mb-3">Matches Per Pair</h3>
               <input type="number" min="1" value={form.matches_per_pair || 5} onChange={(e) => setForm({ ...form, matches_per_pair: Number(e.target.value) })} className="w-32 bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 text-xl font-display" />
            </div>

            <button onClick={() => saveSettings()} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF3B30] font-semibold"><Save size={16} /> Save League Config</button>
          </div>
        )}

        {tab === "Players" && (
          <div className="space-y-4" data-testid="admin-players">
            {players.map((p, i) => (
              <div key={p.id} className="card-tech rounded-xl p-5 grid sm:grid-cols-2 gap-3" data-testid={`admin-player-${p.number}`}>
                <div className="flex items-center gap-3"><span className="font-display text-3xl" style={{ color: TEAM_COLOR[p.team] }}>{p.number}</span>
                  <input value={p.name} onChange={(e) => { const c = [...players]; c[i].name = e.target.value; setPlayers(c); }} className="flex-1 bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" placeholder="Name" /></div>
                <select value={p.team} onChange={(e) => { const c = [...players]; c[i].team = e.target.value; setPlayers(c); }} className="bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2">
                  <option>Team A</option><option>Team B</option><option>Team C</option></select>
                <input value={p.role} onChange={(e) => { const c = [...players]; c[i].role = e.target.value; setPlayers(c); }} className="bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" placeholder="Role" />
                <ImgUpload label="Photo" value={p.photo_url} onChange={(v) => { const c = [...players]; c[i].photo_url = v; setPlayers(c); }} testid={`player-photo-${p.number}`} />
                <textarea value={p.bio} onChange={(e) => { const c = [...players]; c[i].bio = e.target.value; setPlayers(c); }} className="sm:col-span-2 bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" placeholder="Bio" rows={2} />
                <button onClick={() => savePlayer(players[i])} className="sm:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#FF3B30] font-semibold" data-testid={`save-player-${p.number}`}><Save size={15} /> Save Player</button>
              </div>
            ))}
          </div>
        )}

        {tab === "News" && (
          <div className="space-y-4" data-testid="admin-news">
            <div className="card-tech rounded-xl p-5 space-y-3">
              <input value={newNews.title} onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} placeholder="Announcement title" className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" data-testid="news-title" />
              <textarea value={newNews.body} onChange={(e) => setNewNews({ ...newNews, body: e.target.value })} placeholder="Details..." rows={3} className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" data-testid="news-body" />
              <button onClick={addNews} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF3B30] font-semibold" data-testid="news-post"><Plus size={16} /> Publish</button>
            </div>
            {news.map((n) => (
              <div key={n.id} className="card-tech rounded-xl p-5 flex justify-between gap-4" data-testid={`news-item-${n.id}`}>
                <div><h4 className="font-semibold">{n.title}</h4><p className="text-zinc-400 text-sm mt-1">{n.body}</p></div>
                <button onClick={() => delNews(n.id)} className="text-[#FF3B30] shrink-0"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}

        {tab === "Developer" && (
          <div className="card-tech rounded-xl p-6 space-y-4" data-testid="admin-developer">
            <div><span className="text-sm text-zinc-400 block mb-2">Developer Image</span>
              <ImgUpload label="Upload Image" value={form.developer_image_url} onChange={(v) => { setForm({ ...form, developer_image_url: v }); saveSettings({ developer_image_url: v }); }} testid="dev-image-upload" /></div>
            <label className="block text-sm text-zinc-400">About
              <textarea value={form.developer_about || ""} onChange={(e) => setForm({ ...form, developer_about: e.target.value })} rows={6} className="w-full mt-1 bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 text-white" data-testid="dev-about" /></label>
            <button onClick={() => saveSettings()} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF3B30] font-semibold" data-testid="dev-save"><Save size={16} /> Save</button>
          </div>
        )}

        {tab === "History" && (
          <div className="space-y-4" data-testid="admin-history">
            {hist.map((h, i) => (
              <div key={i} className="card-tech rounded-xl p-5 space-y-2">
                <input value={h.year} onChange={(e) => { const c = [...hist]; c[i].year = e.target.value; setHist(c); }} placeholder="Year" className="bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 w-32" />
                <textarea value={h.text} onChange={(e) => { const c = [...hist]; c[i].text = e.target.value; setHist(c); }} placeholder="Milestone" rows={2} className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2" />
                <button onClick={() => { const c = hist.filter((_, x) => x !== i); setHist(c); }} className="text-[#FF3B30] text-sm">Remove</button>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setHist([...hist, { year: "", text: "" }])} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15" data-testid="history-add"><Plus size={16} /> Add Year</button>
              <button onClick={() => saveSettings({ history: hist })} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF3B30] font-semibold" data-testid="history-save"><Save size={16} /> Save History</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
