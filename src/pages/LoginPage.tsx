import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

const SYMBOLS = [
  "🔒", "🛡️", "🔐", "⚔️", "🔑", "🔒", "🛡️", "🔐", "🛡️", "🔒",
  "🔐", "⚔️", "🛡️", "🔒", "🔐", "🛡️", "🔑", "🔒", "🛡️", "🔐",
  "⚔️", "🔑", "🛡️", "🔒", "🔐",
];

const POSITIONS: { top?: string; bottom?: string; left?: string; right?: string }[] = [
  { top: "3%", left: "2%" },
  { top: "8%", right: "8%" },
  { top: "6%", left: "40%" },
  { top: "15%", left: "18%" },
  { top: "18%", right: "15%" },
  { top: "25%", right: "38%" },
  { top: "30%", left: "8%" },
  { top: "38%", right: "5%" },
  { top: "45%", left: "15%" },
  { top: "50%", right: "12%" },
  { top: "55%", left: "45%" },
  { top: "60%", left: "5%" },
  { top: "65%", right: "8%" },
  { bottom: "30%", left: "30%" },
  { bottom: "25%", right: "28%" },
  { bottom: "20%", left: "8%" },
  { bottom: "15%", right: "42%" },
  { bottom: "10%", left: "22%" },
  { bottom: "8%", right: "6%" },
  { bottom: "3%", left: "48%" },
  { top: "10%", left: "60%" },
  { top: "42%", right: "40%" },
  { bottom: "40%", left: "55%" },
  { bottom: "18%", right: "18%" },
  { top: "72%", left: "70%" },
];

const DIRECTIONS = ["up", "down", "left", "right"] as const;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const symbolRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const animatingRef = useRef<Set<number>>(new Set());

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    symbolRefs.current.forEach((el, i) => {
      if (!el || animatingRef.current.has(i)) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(mouseX - cx, mouseY - cy);

      if (dist < 150) {
        animatingRef.current.add(i);
        const dir = DIRECTIONS[Math.floor(Math.random() * 4)];
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.opacity = "0.5";
        el.style.textShadow = "0 0 20px hsl(var(--primary) / 0.8)";
        el.style.animation = `float-${dir} 0.8s ease-out forwards`;

        setTimeout(() => {
          if (el) {
            el.style.animation = "none";
            void el.offsetWidth;
            el.style.opacity = "";
            el.style.textShadow = "";
            el.style.animation = "symbol-pulse 3s ease-in-out infinite";
            el.style.animationDelay = `${i * 0.2}s`;
          }
          animatingRef.current.delete(i);
        }, 800);
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const validate = () => {
    const e: typeof errors = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Privacy symbols background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {SYMBOLS.map((sym, i) => (
          <span
            key={i}
            ref={(el) => { symbolRefs.current[i] = el; }}
            className="absolute text-[2rem] opacity-[0.15] select-none pointer-events-none will-change-transform"
            style={{
              ...POSITIONS[i],
              animation: `symbol-pulse 3s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          >
            {sym}
          </span>
        ))}
      </div>

      {/* Login card */}
      <div className="w-full max-w-[400px] mx-4 animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Privora</h1>
          </div>
          <p className="text-muted-foreground text-sm">Privacy-Preserving Agents</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin-slow" />}
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/signup")} className="text-primary hover:underline">
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
