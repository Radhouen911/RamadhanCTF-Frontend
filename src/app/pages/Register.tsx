import { Eye, EyeOff, Key, Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Footer } from "../components/Footer";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError(
        (err as Error).message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060b15] text-white flex flex-col">
      {/* Backgrounds */}
      <StarField />
      <IslamicPattern />

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/30">
                <Key className="w-6 h-6 text-amber-500" />
              </div>
            </Link>
            <h2 className="font-['Cinzel_Decorative'] text-3xl font-bold text-white mb-2">
              Join the Arena
            </h2>
            <p className="font-[Rajdhani] text-slate-400 text-sm tracking-wider">
              Create your hacker identity
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-400 text-sm font-[Rajdhani]">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-[Rajdhani] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="hacker_01"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-[Rajdhani] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-[Rajdhani] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-[Rajdhani] font-bold text-lg uppercase tracking-widest py-3 rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all active:scale-[0.98] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm font-[Rajdhani]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
              >
                Log In Here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
