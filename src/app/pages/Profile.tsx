import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StarField } from '../components/StarField';
import { IslamicPattern } from '../components/IslamicPattern';
import { Header } from '../components/Header';
import { User, Mail, Shield, Trophy, Activity, Flag, Calendar, Lock, Terminal, Cpu, Globe, Star, Key, Copy, X } from 'lucide-react';
import { Footer } from '../components/Footer';

const SOLVED_HISTORY = [
  { id: 1, name: "Crypto Genesis", category: "Crypto", points: 250, date: "2025-03-01", difficulty: "Hard" },
  { id: 2, name: "Binary Exploitation 101", category: "Pwn", points: 150, date: "2025-03-02", difficulty: "Medium" },
  { id: 3, name: "Web Sockets", category: "Web", points: 100, date: "2025-03-03", difficulty: "Easy" },
  { id: 4, name: "Forensics Investigation", category: "Forensics", points: 200, date: "2025-03-04", difficulty: "Medium" },
  { id: 5, name: "Reverse Engineering", category: "Reversing", points: 300, date: "2025-03-05", difficulty: "Hard" },
];

export function Profile() {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [token, setToken] = useState('');

  const handleGenerateToken = () => {
    // Generate a random token
    const randomToken = 'ctfd_' + Array(3).fill(0).map(() => Math.random().toString(36).substring(2)).join('');
    setToken(randomToken);
    setShowTokenModal(true);
  };

  const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(token);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        // Fallback: manually select the text
        const codeElement = document.querySelector('code');
        if (codeElement) {
            const range = document.createRange();
            range.selectNodeContents(codeElement);
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(160deg, #060b15 0%, #0a0f20 40%, #090d1e 70%, #06090f 100%)' }}
    >
      <StarField />
      <IslamicPattern />
      <Header totalPoints={1000} solvedCount={5} />

      <div className="relative z-10 pt-28 px-4 pb-20 max-w-6xl mx-auto flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Left Column: User Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-1"
          >
            <div className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/5 to-transparent pointer-events-none" />
              
              <div className="relative w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-gradient-to-br from-[#fbbf24] to-[#c084fc]">
                <div className="w-full h-full bg-[#060b15] rounded-full flex items-center justify-center overflow-hidden">
                  <User size={48} className="text-white/80" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white font-[Cinzel] mb-1">Khalid</h2>
              <p className="text-xs uppercase tracking-widest text-[#fbbf24]/60 font-[Rajdhani] mb-6">CyberSultans Team</p>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                  <Mail size={16} className="text-[#fbbf24]" />
                  <span className="text-sm text-white/70 truncate">khalid@example.com</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                  <Shield size={16} className="text-[#fbbf24]" />
                  <span className="text-sm text-white/70">Member</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                  <Calendar size={16} className="text-[#fbbf24]" />
                  <span className="text-sm text-white/70">Joined March 2025</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2.5 bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] font-[Rajdhani] font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-[#fbbf24]/20 transition-all">
                Edit Profile
              </button>

              <button 
                onClick={handleGenerateToken}
                className="w-full mt-3 py-2.5 bg-white/5 border border-white/10 text-white/60 font-[Rajdhani] font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Key size={14} />
                Generate Access Token
              </button>
            </div>
          </motion.div>

          {/* Right Column: Stats & Activity */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Global Rank', value: '#42', icon: Trophy, color: '#fbbf24' },
                { label: 'Total Points', value: '1,000', icon: Star, color: '#34d399' },
                { label: 'Challenges Solved', value: '5', icon: Flag, color: '#c084fc' },
                { label: 'Completion Rate', value: '12%', icon: Activity, color: '#f472b6' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                  className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 relative group hover:border-white/20 transition-all"
                >
                  <div 
                    className="absolute top-4 right-4 p-2 rounded-lg"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon size={20} color={stat.color} />
                  </div>
                  <div className="text-3xl font-bold text-white font-[Rajdhani] mt-4 mb-1">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider text-white/40 font-[Rajdhani]">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Solved History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white font-[Cinzel] mb-6 flex items-center gap-3">
                <Activity className="text-[#fbbf24]" size={20} />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {SOLVED_HISTORY.map((solve, i) => (
                  <motion.div
                    key={solve.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-lg 
                        ${solve.category === 'Crypto' ? 'bg-purple-500/20 text-purple-400' : 
                          solve.category === 'Web' ? 'bg-blue-500/20 text-blue-400' :
                          solve.category === 'Pwn' ? 'bg-red-500/20 text-red-400' :
                          'bg-green-500/20 text-green-400'}`}
                      >
                        {solve.category === 'Crypto' ? <Lock size={18} /> : 
                         solve.category === 'Web' ? <Globe size={18} /> :
                         solve.category === 'Pwn' ? <Terminal size={18} /> :
                         <Cpu size={18} />}
                      </div>
                      <div>
                        <div className="text-white font-medium font-[Rajdhani] text-lg leading-tight group-hover:text-[#fbbf24] transition-colors">{solve.name}</div>
                        <div className="text-white/40 text-xs uppercase tracking-wider mt-1">{solve.category} • {solve.date}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-[#fbbf24] font-bold font-[Rajdhani] text-lg">+{solve.points}</div>
                      <div className={`text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded
                        ${solve.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          solve.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'}`}
                      >
                        {solve.difficulty}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
      <Footer />

      {/* Access Token Modal */}
      <AnimatePresence>
        {showTokenModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#0f172a] border border-[#fbbf24]/20 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <h3 className="font-[Cinzel] font-bold text-white text-lg">API Access Token</h3>
                <button 
                  onClick={() => setShowTokenModal(false)}
                  className="transition-colors text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="mb-4 text-sm text-slate-400 font-[Rajdhani]">
                  This is your personal access token. Treat it like a password. It allows you to authenticate with the API programmatically.
                </p>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-black/40 border-white/10">
                  <code className="flex-1 font-mono text-xs text-[#fbbf24] break-all select-all">
                    {token}
                  </code>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 transition-colors rounded-md hover:bg-white/10 text-white/40 hover:text-white"
                    title="Copy to Clipboard"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={() => setShowTokenModal(false)}
                    className="px-4 py-2 bg-[#fbbf24] hover:bg-[#d97706] text-black font-bold font-[Rajdhani] uppercase tracking-wider text-sm rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
