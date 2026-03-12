import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScoreboardEntry, Team } from "../../services/ctfdApi";
import { ctfdApi } from "../../services/ctfdApi";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";

const CHART_COLORS = [
  "#fbbf24",
  "#c084fc",
  "#60a5fa",
  "#34d399",
  "#f87171",
  "#fb923c",
  "#a78bfa",
  "#38bdf8",
  "#4ade80",
  "#f472b6",
];

type TopSolveEntry = {
  challenge_id: number;
  account_id: number;
  value: number;
  date: string;
};

type TopTeamData = {
  id: number;
  name: string;
  solves: TopSolveEntry[];
};

type ChartPoint = Record<string, number | string>;

type ScoreboardRow = {
  account_id: number;
  name: string;
  score: number;
  place: number | null;
};

const toNormalizedPlace = (value: number | null | undefined) =>
  typeof value === "number" && value > 0 ? value : null;

function mergeStandings(
  scoreboardEntries: ScoreboardEntry[],
  teams: Team[],
): ScoreboardRow[] {
  const merged = new Map<number, ScoreboardRow>();

  scoreboardEntries.forEach((entry) => {
    merged.set(entry.account_id, {
      account_id: entry.account_id,
      name: entry.name,
      score: entry.score ?? 0,
      place: toNormalizedPlace(entry.place),
    });
  });

  teams.forEach((team) => {
    const existing = merged.get(team.id);
    if (existing) {
      merged.set(team.id, {
        ...existing,
        name: existing.name || team.name,
        score: existing.score ?? team.score ?? 0,
        place: existing.place ?? toNormalizedPlace(team.place),
      });
      return;
    }

    merged.set(team.id, {
      account_id: team.id,
      name: team.name,
      score: team.score ?? 0,
      place: toNormalizedPlace(team.place),
    });
  });

  return Array.from(merged.values()).sort((a, b) => {
    if (a.place !== null && b.place !== null) {
      return a.place - b.place;
    }
    if (a.place !== null) {
      return -1;
    }
    if (b.place !== null) {
      return 1;
    }
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.name.localeCompare(b.name);
  });
}

function buildChartData(topData: Record<string, TopTeamData>): {
  chartPoints: ChartPoint[];
  teamNames: string[];
} {
  const teamNames = Object.values(topData).map((t) => t.name);

  // Collect all solve timestamps
  const allDates = new Set<string>();
  Object.values(topData).forEach((team) => {
    team.solves.forEach((solve) => {
      // Round to nearest hour for grouping
      const d = new Date(solve.date);
      d.setMinutes(0, 0, 0);
      allDates.add(d.toISOString());
    });
  });

  const sortedDates = Array.from(allDates).sort();

  // Build cumulative score per team at each time point
  const chartPoints: ChartPoint[] = sortedDates.map((isoTime) => {
    const label = new Date(isoTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const point: ChartPoint = { name: label };
    Object.values(topData).forEach((team) => {
      const cumScore = team.solves
        .filter((s) => new Date(s.date) <= new Date(isoTime))
        .reduce((sum, s) => sum + s.value, 0);
      point[team.name] = cumScore;
    });
    return point;
  });

  return { chartPoints, teamNames };
}

export function Scoreboard() {
  const [standings, setStandings] = useState<ScoreboardRow[]>([]);
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [chartTeams, setChartTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

      return Array.from(
        new Map(allTeams.map((team) => [team.id, team])).values(),
      );
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [boardRes, topRes, teamsRes] = await Promise.all([
          ctfdApi.getScoreboard(),
          ctfdApi.getScoreboardTop(10).catch(() => null),
          fetchAllTeams().catch(() => [] as Team[]),
        ]);

        setStandings(mergeStandings(boardRes.data || [], teamsRes));

        if (topRes?.data && typeof topRes.data === "object") {
          const { chartPoints: pts, teamNames } = buildChartData(
            topRes.data as Record<string, TopTeamData>,
          );
          setChartPoints(pts);
          setChartTeams(teamNames);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load scoreboard",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const myScore = useMemo(() => {
    // Could be used to highlight own entry — leave as 0 for now
    return 0;
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#060b15] text-white flex flex-col">
      <StarField />
      <IslamicPattern />

      <Header totalPoints={myScore} solvedCount={0} />

      <div className="relative z-10 pt-24 px-4 pb-12 max-w-7xl mx-auto w-full flex-1">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="font-['Cinzel_Decorative'] text-4xl font-bold text-amber-400 mb-2">
            Scoreboard
          </h1>
          <p className="font-[Rajdhani] text-amber-500/60 uppercase tracking-widest text-sm">
            Top Hackers of the Night
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-8">
            <p className="text-red-300 font-[Rajdhani] text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Chart — only shown when there is graph data */}
            {chartPoints.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8 p-6 rounded-2xl border border-amber-500/10 bg-[#060b15]/50 backdrop-blur-sm"
              >
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartPoints}>
                      <defs>
                        {chartTeams.map((name, i) => (
                          <linearGradient
                            key={name}
                            id={`color-${i}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={CHART_COLORS[i % CHART_COLORS.length]}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#ffffff10"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#ffffff40"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#ffffff40"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#fbbf2440",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fbbf24" }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      {chartTeams.map((name, i) => (
                        <Area
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          fillOpacity={1}
                          fill={`url(#color-${i})`}
                          strokeWidth={2}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Standings table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="overflow-hidden rounded-2xl border border-amber-500/10 bg-[#060b15]/50 backdrop-blur-sm"
            >
              {standings.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-[Rajdhani] text-white/40 uppercase tracking-widest text-sm">
                    No scores yet
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-amber-500/5 border-b border-amber-500/10">
                    <tr>
                      <th className="py-4 px-6 font-[Rajdhani] text-amber-500/60 font-bold uppercase tracking-wider text-xs w-20">
                        Rank
                      </th>
                      <th className="py-4 px-6 font-[Rajdhani] text-amber-500/60 font-bold uppercase tracking-wider text-xs">
                        Name
                      </th>
                      <th className="py-4 px-6 font-[Rajdhani] text-amber-500/60 font-bold uppercase tracking-wider text-xs text-right w-32">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {standings.map((entry, i) => (
                      <tr
                        key={entry.account_id}
                        className="group hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6 font-[Rajdhani] font-bold text-lg text-white/50 group-hover:text-white transition-colors">
                          #{entry.place ?? i + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-[Rajdhani] font-bold text-xs ${
                                i === 0
                                  ? "bg-amber-500 text-black"
                                  : "bg-white/10 text-white"
                              }`}
                            >
                              {entry.name.substring(0, 2).toUpperCase()}
                            </div>
                            <Link
                              to={`/teams/${entry.account_id}`}
                              className="font-bold text-slate-200 group-hover:text-amber-400 hover:text-amber-400 transition-colors"
                            >
                              {entry.name}
                            </Link>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-[Rajdhani] font-bold text-lg text-amber-400">
                          {entry.score.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
