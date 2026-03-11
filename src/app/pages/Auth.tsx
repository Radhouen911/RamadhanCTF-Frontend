import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { StarField } from '../components/StarField';
import { IslamicPattern } from '../components/IslamicPattern';
import { Eye, EyeOff, Lock, User, Mail, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isLogin && !email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), email.trim(), password);
      }
      navigate('/challenges');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    // StarField and IslamicPattern are fixed-positioned, so overflow-hidden is not needed.
    // Removing it lets the card scroll naturally when taller than the viewport.
    <div className="relative min-h-screen bg-[#060b15] text-white flex flex-col">
      {/* Backgrounds */}
      <StarField />
      <IslamicPattern />

      <div className="flex-1 flex items-start justify-center px-4 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-2xl"
        >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/30">
              <Shield className="w-6 h-6 text-amber-500" />
            </div>
          </Link>
          <h2 className="font-['Cinzel_Decorative'] text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join the Arena'}
          </h2>
          <p className="font-[Rajdhani] text-slate-400 text-sm tracking-wider">
            {isLogin ? 'Enter your credentials to continue' : 'Create your hacker identity'}
          </p>
        </div>

        {/* Form */}
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        >
          {/* Username — always shown */}
          <div className="space-y-1">
            <label className="text-xs font-[Rajdhani] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="hacker_01"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email — register only */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-[Rajdhani] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-[Rajdhani] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-[Rajdhani]">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-[Rajdhani] font-bold text-lg uppercase tracking-widest py-3 rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLogin ? 'Log In' : 'Register'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm font-[Rajdhani]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={switchMode}
              className="ml-2 text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              {isLogin ? 'Register' : 'Log In'}
            </button>
          </p>
        </div>

        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
