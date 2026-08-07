import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiErrorDetail } from "../lib/api";
import { Lock, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await login(email, password);
      nav("/admin");
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm card-tech rounded-2xl p-8" data-testid="login-form">
        <div className="flex justify-center mb-4"><span className="h-14 w-14 rounded-full bg-[#FF3B30] flex items-center justify-center"><Lock size={24} /></span></div>
        <h1 className="font-display text-4xl text-center">ADMIN LOGIN</h1>
        <p className="text-zinc-500 text-center text-sm mb-6">Only the developer can manage content.</p>
        {err && <p className="bg-[#FF3B30]/15 text-[#FF3B30] text-sm rounded-lg px-3 py-2 mb-4" data-testid="login-error">{err}</p>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
          className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-4 py-3 mb-3 outline-none focus:border-[#FF3B30]" data-testid="login-email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
          className="w-full bg-[#0A0A0A] border border-white/15 rounded-lg px-4 py-3 mb-5 outline-none focus:border-[#FF3B30]" data-testid="login-password" />
        <button type="submit" disabled={loading} className="w-full py-3 rounded-full bg-[#FF3B30] font-semibold flex items-center justify-center gap-2 disabled:opacity-60" data-testid="login-submit">
          {loading && <Loader2 size={18} className="animate-spin" />} Sign In
        </button>
      </form>
    </div>
  );
}
