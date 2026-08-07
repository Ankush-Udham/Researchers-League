import { useEffect, useRef, useState } from "react";
import api, { fileUrl, formatApiErrorDetail } from "../lib/api";
import { PageHead } from "../components/shared";
import { useAuth } from "../context/AuthContext";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Gallery() {
  const { isAdmin } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = () => api.get("/gallery").then((r) => setPhotos(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const onUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/gallery/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Photo uploaded!");
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const del = async (id) => {
    try { await api.delete(`/gallery/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div className="min-h-screen">
      <PageHead label="Community Gallery" title="THE GALLERY" accent="#22C55E" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <p className="text-zinc-400 max-w-xl">Anyone can upload photos from their phone or laptop. All uploads are visible to everyone.</p>
          <label className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#22C55E] text-black font-semibold cursor-pointer hover:opacity-90 transition-opacity" data-testid="gallery-upload-btn">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? "Uploading..." : "Upload Photo"}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} data-testid="gallery-file-input" />
          </label>
        </div>
        {photos.length === 0 ? (
          <p className="text-zinc-500">No photos yet. Be the first to upload!</p>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((p) => (
              <div key={p.id} className="relative break-inside-avoid group rounded-xl overflow-hidden border border-white/10" data-testid={`gallery-photo-${p.id}`}>
                <img src={fileUrl(p.storage_path)} alt={p.caption || "photo"} loading="lazy" className="w-full object-cover" />
                {isAdmin && (
                  <button onClick={() => del(p.id)} data-testid={`gallery-delete-${p.id}`}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF3B30]"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
