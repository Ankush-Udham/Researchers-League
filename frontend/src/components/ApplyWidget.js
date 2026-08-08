import { useState } from "react";
import { ClipboardList, X, Send } from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";

export const ApplyWidget = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", program: "BS-MS", year: "", phone: "", sports: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/apply", form);
      toast.success("Application sent successfully!");
      setOpen(false);
      setForm({ name: "", program: "BS-MS", year: "", phone: "", sports: "" });
    } catch {
      toast.error("Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
        <ClipboardList size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X size={20} /></button>
            <h3 className="font-display text-2xl text-[#007AFF] mb-4">Apply for Sports</h3>
            
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#007AFF]" />
              
              <select value={form.program} onChange={e => setForm({...form, program: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#007AFF]">
                <option value="BS-MS">BS-MS</option>
                <option value="PhD">PhD</option>
                <option value="Int-PhD">Int-PhD</option>
              </select>
              
              <input required placeholder="Current Year (e.g., 3rd Year)" value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#007AFF]" />
              
              <input required type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#007AFF]" />
              
              <input required placeholder="Interested Sports" value={form.sports} onChange={e => setForm({...form, sports: e.target.value})} className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#007AFF]" />
              
              <button type="submit" disabled={loading} className="w-full py-2.5 mt-2 rounded-full bg-[#007AFF] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                <Send size={16} /> {loading ? "Sending..." : "Apply Now"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
