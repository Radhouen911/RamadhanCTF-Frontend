import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ctfdApi } from "../../services/ctfdApi";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";
// The design asset was originally exported by Figma using a custom scheme
// `figma:asset/...`. Vite doesn't understand that protocol so we need a
// standard relative path to the image file that actually lives in the
// repo's `src/assets` directory. (relative to this file you have to climb
// two levels, since we're inside `src/app/pages`)

interface EventStats {
  totalChallenges: number;
  totalPoints: number;
  totalTeams: number;
}

export function Landing() {
  const [stats, setStats] = useState<EventStats>({
    totalChallenges: 0,
    totalPoints: 0,
    totalTeams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const [challengesRes, teamsRes] = await Promise.all([
          ctfdApi.getChallenges(),
          ctfdApi.getTeams(),
        ]);

        const challenges = challengesRes.data || [];
        const teams = teamsRes.data || [];

        const totalPoints = challenges.reduce(
          (sum: number, c: any) => sum + (c.value || 0),
          0,
        );

        setStats({
          totalChallenges: challenges.length,
          totalPoints: totalPoints,
          totalTeams: teams.length,
        });
      } catch (error) {
        console.error("Failed to fetch event data:", error);
        // Fall back to default stats
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, []);

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-[#060b15] text-white">
      {/* Backgrounds */}
      <StarField />
      <IslamicPattern />

      {/* Hero Image Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-20 bg-cover bg-center bg-no-repeat pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1765878108610-1797ff4d5fef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSYW1hZGFuJTIwbGFudGVybiUyMG5pZ2h0JTIwZGFyayUyMGdvbGRlbnxlbnwxfHx8fDE3NzIzOTMzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080)`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#060b15]/80 via-[#060b15]/40 to-[#060b15] pointer-events-none" />

      {/* Header */}
      <Header totalPoints={0} solvedCount={0} />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center py-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-2"
        >
          <img
            src="/themes/Ramadhan/static/logo.png"
            alt="Engineers Spark Logo"
            className="w-28 md:w-32 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
          />
        </motion.div>

        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-[Rajdhani] text-amber-400 text-xs tracking-[2px] font-bold uppercase">
            Ramadan 2026 EDITION
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-['Cinzel_Decorative'] text-3xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-wide leading-tight"
          style={{
            background:
              "linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #fbbf24 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.3))",
          }}
        >
          NIGHT OF CODE
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-[Rajdhani] text-sm md:text-base text-slate-300 max-w-xl mx-auto mb-6 tracking-wider leading-tight"
        >
          Unveil the secrets hidden within the digital realm.{" "}
          <br className="hidden md:block" />
          Compete in challenges under the crescent moon.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-5"
        >
          <Link
            to="/challenges"
            className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg font-[Rajdhani] font-bold text-sm md:text-base tracking-[1.5px] text-white uppercase overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <span className="relative z-10">Enter Arena</span>
            <ChevronRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-4 max-w-3xl w-full"
        >
          {(loading
            ? [
                { label: "Prize", value: "$5K" },
                { label: "Teams", value: "--" },
                { label: "Challenges", value: "--" },
                { label: "Duration", value: "48H" },
              ]
            : [
                { label: "Prize", value: "$5K" },
                {
                  label: "Teams",
                  value:
                    stats.totalTeams > 0 ? stats.totalTeams.toString() : "0",
                },
                {
                  label: "Challenges",
                  value:
                    stats.totalChallenges > 0
                      ? stats.totalChallenges.toString()
                      : "0",
                },
                { label: "Duration", value: "48H" },
              ]
          ).map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-[Rajdhani] text-xl md:text-2xl font-bold text-white">
                {stat.value}
              </span>
              <span className="font-[Rajdhani] text-[10px] font-bold text-amber-500/60 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
