import { useState } from "react";
import { MapPin, Phone, MessageCircle, Send } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import api, { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

const WHATSAPP = "https://chat.whatsapp.com/LqyxyTak0S038XSYQxfBgd?s=cl&p=a&ilr=1";

const policies = ["Website Policy", "Copyright Policy", "Privacy Policy", "Terms of Use"];

export const Footer = () => {
  const { t } = useLang();
  const [fb, setFb] = useState({ name: "", email: "", message: "" });
  const [modal, setModal] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!fb.message.trim()) return;
    try {
      await api.post("/feedback", fb);
      toast.success("Thanks for your feedback!");
      setFb({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#0A0A0A]" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <h3 className="label-tag text-xs text-[#FF3B30] mb-4">{t("connect")}</h3>
          <div className="space-y-3 text-zinc-300 text-sm">
            <p className="flex gap-3"><MapPin size={18} className="text-[#007AFF] shrink-0 mt-0.5" />Hostel 7, Room 306, Indian Institute of Science Education and Research Mohali (140306)</p>
            <a href="tel:+918627024084" className="flex gap-3 hover:text-white" data-testid="footer-phone"><Phone size={18} className="text-[#007AFF]" />+91 8627024084</a>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" data-testid="footer-whatsapp"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-[#25D366] text-black font-semibold hover:opacity-90 transition-opacity">
              <MessageCircle size={18} /> {t("join")}
            </a>
          </div>
        </div>

        <div>
          <h3 className="label-tag text-xs text-[#FF3B30] mb-4">Policies</h3>
          <ul className="space-y-2 text-sm text-zinc-300">
            {policies.map((p) => (
              <li key={p}><button data-testid={`policy-${p.replace(/\s/g, "-").toLowerCase()}`} onClick={() => setModal(p)} className="hover:text-white transition-colors">{p}</button></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="label-tag text-xs text-[#FF3B30] mb-4">Website Feedback</h3>
          <form onSubmit={submit} className="space-y-2" data-testid="feedback-form">
            <input value={fb.name} onChange={(e) => setFb({ ...fb, name: e.target.value })} placeholder="Name (optional)"
              className="w-full bg-[#141414] border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-[#FF3B30] outline-none" data-testid="feedback-name" />
            <textarea value={fb.message} onChange={(e) => setFb({ ...fb, message: e.target.value })} placeholder="Your feedback..." rows={3}
              className="w-full bg-[#141414] border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-[#FF3B30] outline-none" data-testid="feedback-message" />
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors" data-testid="feedback-submit">
              <Send size={15} /> Send
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-zinc-400 text-sm">
        <p>© {new Date().getFullYear()} IISER Mohali Sports League. All rights reserved.</p>
        <p className="mt-1 text-zinc-500">Website maintained by <span className="text-white font-semibold">ANKUSH UDHAM</span></p>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4" onClick={() => setModal(null)} data-testid="policy-modal">
          <div className="bg-[#141414] border border-white/15 rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-display text-2xl mb-3">{modal}</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              This {modal} governs your use of the IISER Mohali Sports League website. Content is provided for the league community.
              Player data, schedules and media are managed solely by the site developer. Uploaded photos remain the responsibility of the uploader.
              We do not sell personal data. By using this site you agree to these terms. For questions contact +91 8627024084.
            </p>
            <button onClick={() => setModal(null)} className="mt-5 px-4 py-2 rounded-full bg-[#FF3B30] font-semibold text-sm">Close</button>
          </div>
        </div>
      )}
    </footer>
  );
};
