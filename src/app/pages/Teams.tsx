import { motion } from 'motion/react';
import { StarField } from '../components/StarField';
import { IslamicPattern } from '../components/IslamicPattern';
import { Header } from '../components/Header';
import { Trophy, Shield, Target, Users, Search, Medal, Star } from 'lucide-react';
import { Footer } from '../components/Footer';

const MOCK_TEAMS = [
  { rank: 1, name: "CyberSultans", members: 4, score: 12450, solved: 42, avatar: "CS" },
  { rank: 2, name: "NightOwls", members: 3, score: 11200, solved: 38, avatar: "NO" },
  { rank: 3, name: "IftarInterrupt", members: 5, score: 10800, solved: 36, avatar: "II" },
  { rank: 4, name: "DuneDiggers", members: 2, score: 9500, solved: 31, avatar: "DD" },
  { rank: 5, name: "CrescentOps", members: 4, score: 8900, solved: 29, avatar: "CO" },
  { rank: 6, name: "BinaryBedouins", members: 3, score: 8200, solved: 27, avatar: "BB" },
  { rank: 7, name: "OasisSec", members: 4, score: 7600, solved: 25, avatar: "OS" },
  { rank: 8, name: "MirageHunters", members: 2, score: 6400, solved: 21, avatar: "MH" },
  { rank: 9, name: "SandStorm", members: 3, score: 5800, solved: 19, avatar: "SS" },
  { rank: 10, name: "Falcons", members: 4, score: 5200, solved: 17, avatar: "FA" },
];

export function Teams() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(160deg, #060b15 0%, #0a0f20 40%, #090d1e 70%, #06090f 100%)' }}
    >
      <StarField />
      <IslamicPattern />
      <Header totalPoints={8900} solvedCount={29} />

      <div className="relative z-10 pt-28 px-4 pb-20 max-w-6xl mx-auto flex-1 w-full">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1
            style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '42px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #fbbf24, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px',
              marginBottom: '8px',
            }}
          >
            Competing Teams
          </h1>
          <p
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '14px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Join forces & Conquer the Leaderboard
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Registered Teams', value: '48', icon: Shield, color: '#fbbf24' },
            { label: 'Active Players', value: '156', icon: Users, color: '#34d399' },
            { label: 'Avg Team Score', value: '4,250', icon: Target, color: '#c084fc' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl relative overflow-hidden group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon size={64} color={stat.color} />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-xl" style={{ background: `${stat.color}15` }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '32px', fontWeight: '700', color: 'white' }}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="Search teams..."
              className="w-full pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#fbbf24]/50 transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: 'Rajdhani, sans-serif',
              }}
            />
          </div>
          <button
            className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-[#fbbf24]/20 transition-colors"
            style={{
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.3)',
              color: '#fbbf24',
              fontFamily: 'Rajdhani, sans-serif',
            }}
          >
            Create Team
          </button>
        </div>

        {/* Teams Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(6, 11, 21, 0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="p-4 pl-8 text-white/40 font-medium uppercase text-xs tracking-wider font-[Rajdhani]">Rank</th>
                <th className="p-4 text-white/40 font-medium uppercase text-xs tracking-wider font-[Rajdhani]">Team Name</th>
                <th className="p-4 text-white/40 font-medium uppercase text-xs tracking-wider font-[Rajdhani]">Members</th>
                <th className="p-4 text-white/40 font-medium uppercase text-xs tracking-wider font-[Rajdhani]">Solved</th>
                <th className="p-4 pr-8 text-right text-white/40 font-medium uppercase text-xs tracking-wider font-[Rajdhani]">Score</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TEAMS.map((team, idx) => (
                <motion.tr
                  key={team.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="p-4 pl-8">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-[Rajdhani] font-bold text-lg
                      ${team.rank === 1 ? 'bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/40' :
                        team.rank === 2 ? 'bg-[#94a3b8]/20 text-[#94a3b8] border border-[#94a3b8]/40' :
                        team.rank === 3 ? 'bg-[#b45309]/20 text-[#b45309] border border-[#b45309]/40' :
                        'text-white/40'}`}
                    >
                      {team.rank}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-white/10 to-white/5 text-white/80 border border-white/10">
                        {team.avatar}
                      </div>
                      <span className="text-white font-[Rajdhani] font-semibold tracking-wide text-lg">{team.name}</span>
                      {team.rank <= 3 && <Medal size={14} className="text-[#fbbf24]" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex -space-x-2">
                      {[...Array(team.members)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-[#0a0f20] border-2 border-[#1a1f2e] flex items-center justify-center text-[10px] text-white/50">
                          <Users size={12} />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-white/60 font-[Rajdhani] text-lg font-medium">{team.solved}</td>
                  <td className="p-4 pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Star size={14} className="text-[#fbbf24]" fill="#fbbf24" />
                      <span className="text-[#fbbf24] font-[Rajdhani] font-bold text-xl">{team.score.toLocaleString()}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
