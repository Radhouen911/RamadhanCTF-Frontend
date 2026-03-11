import {
  Medal,
  Search,
  Shield,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { ScoreboardEntry, Team } from "../../services/ctfdApi";
import { ctfdApi } from "../../services/ctfdApi";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";
import { useAuth } from "../context/AuthContext";

type ConfigMap = Record<string, unknown>;

interface TeamRow {
  id: number;
  name: string;
  rank: number | null;
  score: number;
  memberCount: number | null;
  avatar: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDev = (import.meta as any).env?.DEV === true;
const debugLog = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

const normalizeConfig = (data: unknown): ConfigMap => {
  if (Array.isArray(data)) {
    return data.reduce<ConfigMap>((acc, entry) => {
      if (entry && typeof entry === "object") {
        const key =
          "key" in entry
            ? entry.key
            : "name" in entry
              ? entry.name
              : undefined;
        const value = "value" in entry ? entry.value : undefined;

        if (typeof key === "string") {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
  }

  if (data && typeof data === "object") {
    return data as ConfigMap;
  }

  return {};
};

const isTeamsModeEnabled = (config: ConfigMap) => {
  if (typeof config.team_mode === "boolean") {
    return config.team_mode;
  }

  if (!("user_mode" in config) && !("team_mode" in config)) {
    return true;
  }

  const rawMode = String(config.user_mode ?? config.team_mode ?? "").toLowerCase();
  return rawMode === "teams" || rawMode === "team";
};

const getAvatar = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "TM";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
};

const getMemberCount = (team: Team) => {
  if (typeof team.members_count === "number") {
    return team.members_count;
  }

  if (Array.isArray(team.members)) {
    return team.members.length;
  }

  return null;
};

const isForbiddenError = (error: unknown) =>
  error instanceof Error && error.message.includes("403");

export function Teams() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teamsEnabled, setTeamsEnabled] = useState(true);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [query, setQuery] = useState("");
  const [errorState, setErrorState] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAllTeams = async () => {
      const allTeams: Team[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext && page <= 100) {
        const response = await ctfdApi.getTeams({ page });
        allTeams.push(...(response.data || []));

        const pagination = response.meta?.pagination;
        if (!pagination) {
          hasNext = false;
        } else if (typeof pagination.pages === "number") {
          hasNext = page < pagination.pages;
        } else {
          hasNext = Boolean(pagination.next);
        }

        page += 1;
      }

      return Array.from(new Map(allTeams.map((team) => [team.id, team])).values());
    };

    const loadTeams = async () => {
      setLoading(true);
      setErrorState(null);

      try {
        const configResponse = await ctfdApi.getConfig().catch(() => null);
        const config = normalizeConfig(configResponse?.data);
        const enabled = isTeamsModeEnabled(config);

        if (!mounted) {
          return;
        }

        setTeamsEnabled(enabled);

        if (!enabled) {
          setTeams([]);
          return;
        }

        const [teamData, scoreboardData] = await Promise.all([
          fetchAllTeams(),
          ctfdApi
            .getScoreboard()
            .then((response) => response.data || [])
            .catch(() => [] as ScoreboardEntry[]),
        ]);

        const scoreboardById = new Map(
          scoreboardData.map((entry) => [entry.account_id, entry]),
        );

        const teamRows = teamData
          .map((team) => {
            const scoreboardEntry = scoreboardById.get(team.id);
            return {
              id: team.id,
              name: team.name,
              rank: scoreboardEntry?.place ?? team.place ?? null,
              score: scoreboardEntry?.score ?? team.score ?? 0,
              memberCount: getMemberCount(team),
              avatar: getAvatar(team.name),
            };
          })
          .sort((a, b) => {
            if (a.rank !== null && b.rank !== null) {
              return a.rank - b.rank;
            }
            if (a.rank !== null) {
              return -1;
            }
            if (b.rank !== null) {
              return 1;
            }
            if (b.score !== a.score) {
              return b.score - a.score;
            }
            return a.name.localeCompare(b.name);
          });

        if (mounted) {
          setTeams(teamRows);
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        debugLog("[Teams] Failed to load teams page data", error);

        if (isForbiddenError(error)) {
          setErrorState({
            title: isAuthenticated
              ? "Teams are currently unavailable"
              : "Log in to view teams",
            description: isAuthenticated
              ? "This event is currently hiding team information or your account does not have access to it yet."
              : "Please sign in to view participating teams for this event.",
          });
        } else {
          setErrorState({
            title: "Unable to load teams",
            description:
              "We could not load the teams list right now. Please refresh the page and try again.",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTeams();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const filteredTeams = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return teams;
    }

    return teams.filter((team) => team.name.toLowerCase().includes(term));
  }, [query, teams]);

  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const rankedTeams = teams.filter((team) => team.rank !== null).length;
    const averageScore =
      totalTeams > 0
        ? Math.round(teams.reduce((sum, team) => sum + team.score, 0) / totalTeams)
        : 0;

    return [
      {
        label: "Registered Teams",
        value: totalTeams.toLocaleString(),
        icon: Shield,
        color: "#fbbf24",
      },
      {
        label: "Ranked Teams",
        value: rankedTeams.toLocaleString(),
        icon: Trophy,
        color: "#34d399",
      },
      {
        label: "Avg Team Score",
        value: averageScore.toLocaleString(),
        icon: Target,
        color: "#c084fc",
      },
    ];
  }, [teams]);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #060b15 0%, #0a0f20 40%, #090d1e 70%, #06090f 100%)",
      }}
    >
      <StarField />
      <IslamicPattern />
      <Header totalPoints={user?.score ?? 0} solvedCount={0} />

      <div className="relative z-10 pt-28 px-4 pb-20 max-w-6xl mx-auto flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1
            style={{
              fontFamily: "Cinzel Decorative, serif",
              fontSize: "42px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #fbbf24, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            Competing Teams
          </h1>
          <p
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "14px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Live team standings powered by CTFd
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08, duration: 0.45 }}
              className="p-6 rounded-2xl relative overflow-hidden group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon size={64} color={stat.color} />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-xl" style={{ background: `${stat.color}15` }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <span
                  style={{
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: "12px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {loading && !errorState ? "—" : stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="mb-6 rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
          }}
        >
          {!teamsEnabled ? (
            <p
              style={{
                fontFamily: "Rajdhani, sans-serif",
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.6,
              }}
            >
              This event is running in individual user mode, so team features are currently disabled.
            </p>
          ) : authLoading ? (
            <p
              style={{
                fontFamily: "Rajdhani, sans-serif",
                color: "rgba(255,255,255,0.68)",
              }}
            >
              Loading team access...
            </p>
          ) : user?.team_id ? (
            <p
              style={{
                fontFamily: "Rajdhani, sans-serif",
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.6,
              }}
            >
              You are already on a team. Open the native CTFd team page to manage membership and invitations:{" "}
              <a href="/team" style={{ color: "#fbbf24", textDecoration: "underline" }}>
                My Team
              </a>
            </p>
          ) : isAuthenticated ? (
            <p
              style={{
                fontFamily: "Rajdhani, sans-serif",
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.6,
              }}
            >
              Need a team before competing? Use the native CTFd flow:{" "}
              <a href="/teams/new" style={{ color: "#fbbf24", textDecoration: "underline" }}>
                Create Team
              </a>
              {" "}or{" "}
              <a href="/teams/join" style={{ color: "#c084fc", textDecoration: "underline" }}>
                Join Team
              </a>
            </p>
          ) : (
            <p
              style={{
                fontFamily: "Rajdhani, sans-serif",
                color: "rgba(255,255,255,0.68)",
                lineHeight: 1.6,
              }}
            >
              Please <a href="/login" style={{ color: "#fbbf24", textDecoration: "underline" }}>log in</a> to join or create a team.
            </p>
          )}
        </motion.div>

        {teamsEnabled && !errorState && (
          <div className="flex justify-between items-center mb-6 gap-4 flex-col sm:flex-row">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                placeholder="Search teams..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#fbbf24]/50 transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontFamily: "Rajdhani, sans-serif",
                }}
              />
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(6, 11, 21, 0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          {loading ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-400 rounded-full mx-auto mb-4"
              />
              <p className="font-[Rajdhani] text-amber-400 text-sm tracking-widest uppercase">
                Loading Teams...
              </p>
            </div>
          ) : errorState ? (
            <div className="p-8 text-center">
              <h2
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "8px",
                }}
              >
                {errorState.title}
              </h2>
              <p
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  color: "rgba(255,255,255,0.62)",
                  lineHeight: 1.6,
                }}
              >
                {errorState.description}
              </p>
            </div>
          ) : !teamsEnabled ? (
            <div className="p-8 text-center">
              <h2
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "8px",
                }}
              >
                Teams are disabled for this event
              </h2>
              <p
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  color: "rgba(255,255,255,0.62)",
                }}
              >
                This CTF is currently configured to run without team accounts.
              </p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="p-8 text-center">
              <h2
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "8px",
                }}
              >
                {teams.length === 0 ? "No teams yet" : "No teams match your search"}
              </h2>
              <p
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  color: "rgba(255,255,255,0.62)",
                }}
              >
                {teams.length === 0
                  ? "Teams will appear here as soon as participants create them."
                  : "Try a different search term to find the team you're looking for."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th className="p-4 pl-8 text-white/40 font-medium uppercase text-xs tracking-wider font-[Rajdhani]">Rank</th>
                  <th className="p-4 text-white/40 font-medium uppercase text-xs tracking-wider font-[Rajdhani]">Team Name</th>
                  <th className="p-4 text-white/40 font-medium uppercase text-xs tracking-wider font-[Rajdhani]">Members</th>
                  <th className="p-4 pr-8 text-right text-white/40 font-medium uppercase text-xs tracking-wider font-[Rajdhani]">Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team, idx) => (
                  <motion.tr
                    key={team.id}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td className="p-4 pl-8">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-[Rajdhani] font-bold text-lg ${team.rank === 1 ? "bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/40" : team.rank === 2 ? "bg-[#94a3b8]/20 text-[#94a3b8] border border-[#94a3b8]/40" : team.rank === 3 ? "bg-[#b45309]/20 text-[#b45309] border border-[#b45309]/40" : "text-white/40"}`}>
                        {team.rank ?? "—"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br from-white/10 to-white/5 text-white/80 border border-white/10">
                          {team.avatar}
                        </div>
                        <span className="text-white font-[Rajdhani] font-semibold tracking-wide text-lg">{team.name}</span>
                        {team.rank !== null && team.rank <= 3 && <Medal size={14} className="text-[#fbbf24]" />}
                      </div>
                    </td>
                    <td className="p-4 text-white/60 font-[Rajdhani] text-lg font-medium">{team.memberCount ?? "—"}</td>
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
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
