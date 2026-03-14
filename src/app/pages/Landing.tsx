import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import logoImg from "../../assets/logo.png";
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

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CtfTimingConfig {
  start: string | number | null;
  end: string | number | null;
}

type CtfStatus = "loading" | "before" | "active" | "ended";

const ZERO_TIME: CountdownState = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

const parseCtfDate = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value > 1000000000 ? new Date(value * 1000) : new Date(value);
  }

  const numericValue = Number.parseInt(value, 10);
  if (!Number.isNaN(numericValue) && numericValue > 1000000000) {
    return new Date(numericValue * 1000);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDuration = (
  start: string | number | null,
  end: string | number | null,
) => {
  const startDate = parseCtfDate(start);
  const endDate = parseCtfDate(end);

  if (!startDate || !endDate) {
    return "--";
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs <= 0) {
    return "--";
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hours > 0 ? `${days}D ${hours}H` : `${days}D`;
  }

  if (hours > 0) {
    return minutes > 0 ? `${hours}H ${minutes}M` : `${hours}H`;
  }

  return `${Math.max(minutes, 1)}M`;
};

export function Landing() {
  const [stats, setStats] = useState<EventStats>({
    totalChallenges: 0,
    totalPoints: 0,
    totalTeams: 0,
  });
  const [loading, setLoading] = useState(true);
  const [ctfStatus, setCtfStatus] = useState<CtfStatus>("loading");
  const [ctfConfig, setCtfConfig] = useState<CtfTimingConfig | null>(null);
  const [timeLeft, setTimeLeft] = useState<CountdownState>(ZERO_TIME);
  const [durationLabel, setDurationLabel] = useState("--");

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

  useEffect(() => {
    const syncCtfTiming = () => {
      try {
        const init = (
          window as Window & {
            init?: {
              ctfStart?: string | number | null;
              ctfEnd?: string | number | null;
            };
          }
        ).init;

        const start = init?.ctfStart ?? null;
        const end = init?.ctfEnd ?? null;

        setCtfConfig({ start, end });
        setDurationLabel(formatDuration(start, end));

        const now = new Date();
        const startDate = parseCtfDate(start);
        const endDate = parseCtfDate(end);

        if (!startDate) {
          setCtfStatus("active");
          return;
        }

        if (now < startDate) {
          setCtfStatus("before");
          return;
        }

        if (endDate && now > endDate) {
          setCtfStatus("ended");
          return;
        }

        setCtfStatus("active");
      } catch (error) {
        console.error("[Landing Timer] Failed to load CTF timing:", error);
        setCtfStatus("active");
      }
    };

    syncCtfTiming();
    const refresh = window.setInterval(syncCtfTiming, 30000);

    return () => window.clearInterval(refresh);
  }, []);

  useEffect(() => {
    if (!ctfConfig || ctfStatus !== "before") {
      setTimeLeft(ZERO_TIME);
      return;
    }

    const startDate = parseCtfDate(ctfConfig.start);
    if (!startDate) {
      setTimeLeft(ZERO_TIME);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = startDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft(ZERO_TIME);
        setCtfStatus("active");
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = window.setInterval(calculateTimeLeft, 1000);

    return () => window.clearInterval(timer);
  }, [ctfConfig, ctfStatus]);

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
            src={logoImg}
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
            Ramadan 1447 AH Edition
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

        {/* Timer bar removed as requested */}

        {/* Timer bar and duration removed as requested */}

        {ctfStatus === "ended" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mb-6 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-5 py-3 backdrop-blur-md"
          >
            <p className="font-[Rajdhani] text-sm md:text-base tracking-[3px] uppercase text-rose-300 font-bold">
              CTF Has Ended — Thanks For Participating
            </p>
          </motion.div>
        )}

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
          className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 max-w-3xl w-full"
        >
          {(loading
            ? [
                { label: "Teams", value: "--" },
                { label: "Challenges", value: "--" },
                // Duration removed
              ]
            : [
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
                // Duration removed
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
