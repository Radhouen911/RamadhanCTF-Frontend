import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Team, User, UserAward, UserSolve } from "../../services/ctfdApi";
import { ctfdApi } from "../../services/ctfdApi";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";
import { VisibilityNotice } from "../components/VisibilityNotice";
import { useAuth } from "../context/AuthContext";
import { canAccessVisibility, useAppConfig } from "../context/ConfigContext";

type SolveChartPoint = {
  name: string;
  score: number;
};

const buildSolveProgress = (solves: UserSolve[]): SolveChartPoint[] => {
  const ordered = [...solves].sort((a, b) => {
    const aDate = new Date(a.date || 0).getTime();
    const bDate = new Date(b.date || 0).getTime();
    return aDate - bDate;
  });

  let runningScore = 0;
  return ordered.map((solve, index) => {
    const value = solve.value ?? solve.challenge?.value ?? 0;
    runningScore += value;
    return {
      name:
        solve.date && Number.isFinite(new Date(solve.date).getTime())
          ? new Date(solve.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : `Solve ${index + 1}`,
      score: runningScore,
    };
  });
};

export function PublicUserProfile() {
  const { userId } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { scoreVisibility, loading: configLoading } = useAppConfig();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [solves, setSolves] = useState<UserSolve[]>([]);
  const [awards, setAwards] = useState<UserAward[]>([]);

  const canViewScores = canAccessVisibility(scoreVisibility, {
    isAuthenticated,
    isAdmin: Boolean(user?.isAdmin),
  });

  useEffect(() => {
    if (authLoading || configLoading) {
      return;
    }

    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      setError("Invalid user profile id");
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileResponse = await ctfdApi.getUser(parsed);
        const profileData = profileResponse.data || null;
        setProfile(profileData);

        if (!profileData) {
          setTeam(null);
          setSolves([]);
          setAwards([]);
          return;
        }

        const [solvesResponse, awardsResponse, teamResponse] =
          await Promise.all([
            canViewScores
              ? ctfdApi
                  .getUserSolves(parsed)
                  .catch(() => ({ data: [] as UserSolve[] }))
              : Promise.resolve({ data: [] as UserSolve[] }),
            ctfdApi
              .getUserAwards(parsed)
              .catch(() => ({ data: [] as UserAward[] })),
            profileData.team_id
              ? ctfdApi
                  .getTeam(profileData.team_id)
                  .catch(() => ({ data: null as Team | null }))
              : Promise.resolve({ data: null as Team | null }),
          ]);

        setSolves(
          Array.isArray(solvesResponse.data) ? solvesResponse.data : [],
        );
        setAwards(
          Array.isArray(awardsResponse.data) ? awardsResponse.data : [],
        );
        setTeam(teamResponse.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authLoading, canViewScores, configLoading, userId]);

  const solveChartData = useMemo(() => buildSolveProgress(solves), [solves]);

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
      <Header />

      <main className="relative z-10 pt-28 px-4 pb-20 max-w-4xl mx-auto flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <Link
            to="/teams"
            className="font-[Rajdhani] text-sm uppercase tracking-wider"
            style={{ color: "#fbbf24" }}
          >
            ← Back to Teams
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg"
        >
          {loading ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#fbbf24] mx-auto mb-4" />
              <p className="font-[Rajdhani] text-white/70">
                Loading profile...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-[Rajdhani] text-sm">{error}</p>
            </div>
          ) : !profile ? (
            <p className="font-[Rajdhani] text-white/70">Profile not found.</p>
          ) : (
            <>
              <h1 className="font-['Cinzel_Decorative'] text-4xl font-bold text-white mb-2">
                {profile.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                {team ? (
                  <Link
                    to={`/teams/${team.id}`}
                    className="px-3 py-1.5 rounded-full border border-[#fbbf24]/35 bg-[#fbbf24]/10 text-[#fbbf24] font-[Rajdhani] text-xs uppercase tracking-wider"
                  >
                    Team: {team.name}
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/70 font-[Rajdhani] text-xs uppercase tracking-wider">
                    No Team
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80 font-[Rajdhani] text-xs uppercase tracking-wider">
                  Awards: {awards.length}
                </span>
                {canViewScores && (
                  <span className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80 font-[Rajdhani] text-xs uppercase tracking-wider">
                    Solves: {solves.length}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {canViewScores && (
                  <>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                        Score
                      </p>
                      <p className="font-[Rajdhani] text-white">
                        {profile.score ?? 0}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                        Rank
                      </p>
                      <p className="font-[Rajdhani] text-white">
                        {profile.place ?? "—"}
                      </p>
                    </div>
                  </>
                )}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                    Email
                  </p>
                  <p className="font-[Rajdhani] text-white">
                    {profile.email || "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {canViewScores ? (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-[Rajdhani] text-sm uppercase tracking-wider text-white/60 mb-3">
                      Solve Progress
                    </p>
                    {solveChartData.length === 0 ? (
                      <p className="font-[Rajdhani] text-white/60 text-sm">
                        No solves yet.
                      </p>
                    ) : (
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={solveChartData}>
                            <defs>
                              <linearGradient
                                id="userSolveGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#fbbf24"
                                  stopOpacity={0.35}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#fbbf24"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#ffffff10"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="name"
                              stroke="#ffffff50"
                              tickLine={false}
                              axisLine={false}
                              fontSize={12}
                            />
                            <YAxis
                              stroke="#ffffff50"
                              tickLine={false}
                              axisLine={false}
                              fontSize={12}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                borderColor: "#fbbf2440",
                                borderRadius: "8px",
                                color: "#fff",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="score"
                              stroke="#fbbf24"
                              fillOpacity={1}
                              fill="url(#userSolveGradient)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                ) : (
                  <VisibilityNotice
                    title="User solves are hidden"
                    description="Dark hour is active right now. Solve progress, solve history, rank, and score are hidden for all non-admin players."
                  />
                )}

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-sm uppercase tracking-wider text-white/60 mb-3">
                    Awards
                  </p>
                  {awards.length === 0 ? (
                    <p className="font-[Rajdhani] text-white/60 text-sm">
                      No awards yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                      {awards.map((award, index) => (
                        <div
                          key={`${award.id ?? "award"}-${index}`}
                          className="px-3 py-2 rounded-lg border border-white/10 bg-white/5"
                        >
                          <p className="font-[Rajdhani] text-white text-sm font-semibold">
                            {award.name || "Award"}
                          </p>
                          {(award.description || award.category) && (
                            <p className="font-[Rajdhani] text-white/60 text-xs">
                              {award.description || award.category}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {canViewScores && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-sm uppercase tracking-wider text-white/60 mb-3">
                    Solves
                  </p>
                  {solves.length === 0 ? (
                    <p className="font-[Rajdhani] text-white/60 text-sm">
                      No solves yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[260px] overflow-auto pr-1">
                      {[...solves]
                        .sort(
                          (a, b) =>
                            new Date(b.date || 0).getTime() -
                            new Date(a.date || 0).getTime(),
                        )
                        .map((solve, index) => (
                          <div
                            key={`${solve.challenge_id ?? "solve"}-${solve.date ?? index}`}
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="font-[Rajdhani] text-white text-sm font-semibold truncate">
                                {solve.challenge?.name ||
                                  `Challenge #${solve.challenge_id ?? "?"}`}
                              </p>
                              <p className="font-[Rajdhani] text-white/60 text-xs">
                                {solve.date
                                  ? new Date(solve.date).toLocaleString()
                                  : "Unknown time"}
                              </p>
                            </div>
                            <span className="font-[Rajdhani] text-[#fbbf24] text-sm font-bold shrink-0">
                              +{solve.value ?? solve.challenge?.value ?? 0}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
