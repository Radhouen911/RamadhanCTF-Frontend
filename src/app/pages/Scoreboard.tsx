import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StarField } from '../components/StarField';
import { IslamicPattern } from '../components/IslamicPattern';
import { Header } from '../components/Header';

import { Footer } from '../components/Footer';

const data = [
  { name: '10:00', Khalid: 0, TeamB: 0, TeamC: 0 },
  { name: '11:00', Khalid: 150, TeamB: 50, TeamC: 20 },
  { name: '12:00', Khalid: 150, TeamB: 150, TeamC: 80 },
  { name: '13:00', Khalid: 450, TeamB: 200, TeamC: 150 },
  { name: '14:00', Khalid: 450, TeamB: 350, TeamC: 300 },
  { name: '15:00', Khalid: 600, TeamB: 450, TeamC: 380 },
  { name: '16:00', Khalid: 600, TeamB: 500, TeamC: 420 },
];

const standings = [
    { rank: 1, name: 'Khalid', solves: 12, points: 600, country: 'SA' },
    { rank: 2, name: 'CyberFalcons', solves: 10, points: 500, country: 'AE' },
    { rank: 3, name: 'DesertFoxes', solves: 9, points: 420, country: 'EG' },
    { rank: 4, name: 'MidnightCoders', solves: 8, points: 380, country: 'MA' },
    { rank: 5, name: 'NullPointers', solves: 6, points: 300, country: 'JO' },
    { rank: 6, name: 'RedCrescent', solves: 5, points: 250, country: 'QA' },
    { rank: 7, name: 'OasisSec', solves: 4, points: 200, country: 'OM' },
];

export function Scoreboard() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#060b15] text-white flex flex-col">
      <StarField />
      <IslamicPattern />
      
      <Header totalPoints={600} solvedCount={12} />

      <div className="relative z-10 pt-24 px-4 pb-12 max-w-7xl mx-auto w-full flex-1">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
        >
            <h1 className="font-['Cinzel_Decorative'] text-4xl font-bold text-amber-400 mb-2">Scoreboard</h1>
            <p className="font-[Rajdhani] text-amber-500/60 uppercase tracking-widest text-sm">Top Hackers of the Night</p>
        </motion.div>

        {/* Chart */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 p-6 rounded-2xl border border-amber-500/10 bg-[#060b15]/50 backdrop-blur-sm"
        >
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorKhalid" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTeamB" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#fbbf2440', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fbbf24' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Area type="monotone" dataKey="Khalid" stroke="#fbbf24" fillOpacity={1} fill="url(#colorKhalid)" strokeWidth={2} />
                        <Area type="monotone" dataKey="TeamB" stroke="#c084fc" fillOpacity={1} fill="url(#colorTeamB)" strokeWidth={2} />
                        <Area type="monotone" dataKey="TeamC" stroke="#60a5fa" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>

        {/* Table */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="overflow-hidden rounded-2xl border border-amber-500/10 bg-[#060b15]/50 backdrop-blur-sm"
        >
            <table className="w-full text-left">
                <thead className="bg-amber-500/5 border-b border-amber-500/10">
                    <tr>
                        <th className="py-4 px-6 font-[Rajdhani] text-amber-500/60 font-bold uppercase tracking-wider text-xs w-20">Rank</th>
                        <th className="py-4 px-6 font-[Rajdhani] text-amber-500/60 font-bold uppercase tracking-wider text-xs">Team</th>
                        <th className="py-4 px-6 font-[Rajdhani] text-amber-500/60 font-bold uppercase tracking-wider text-xs text-center w-32">Solves</th>
                        <th className="py-4 px-6 font-[Rajdhani] text-amber-500/60 font-bold uppercase tracking-wider text-xs text-right w-32">Points</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {standings.map((team, i) => (
                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                            <td className="py-4 px-6 font-[Rajdhani] font-bold text-lg text-white/50 group-hover:text-white transition-colors">#{team.rank}</td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-[Rajdhani] font-bold text-xs ${i === 0 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white'}`}>
                                        {team.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors">{team.name}</span>
                                    <span className="text-xs text-white/30 ml-2">{team.country}</span>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-center font-mono text-slate-400">{team.solves}</td>
                            <td className="py-4 px-6 text-right font-[Rajdhani] font-bold text-lg text-amber-400">{team.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
