import { useState } from "react";
import { motion } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import { PageHead } from "../components/shared";
import { fileUrl } from "../lib/api";
import { Code2 } from "lucide-react";

export default function Developer() {
  const { settings } = useSettings();
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const img = settings?.developer_image_url ? (settings.developer_image_url.startsWith("http") ? settings.developer_image_url : fileUrl(settings.developer_image_url)) : null;

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 20;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -20;
    setRot({ x: y, y: x });
  };

  return (
    <div className="min-h-screen">
      <PageHead label="Developer Section" title="THE DEVELOPER" accent="#007AFF" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex justify-center py-8" onMouseMove={move} onMouseLeave={() => setRot({ x: 0, y: 0 })} style={{ perspective: 1000 }}>
          <motion.div animate={{ rotateX: rot.x, rotateY: rot.y }} transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-3xl overflow-hidden border border-white/15" style={{ transformStyle: "preserve-3d" }} data-testid="developer-image">
            {img ? <img src={img} alt="developer" className="w-full h-full object-cover" /> :
              <div className="w-full h-full bg-gradient-to-br from-[#1F1F1F] to-[#0A0A0A] flex items-center justify-center"><Code2 size={72} className="text-[#007AFF]" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>
        </div>
        <div className="prose prose-invert max-w-none text-center">
          <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-line" data-testid="developer-about">
            {settings?.developer_about || "This section is customizable. The developer can add their story, skills and vision here from the admin panel."}
          </p>
        </div>
      </div>
    </div>
  );
}
