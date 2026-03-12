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
import type { Team, TeamAward, TeamSolve, User } from "../../services/ctfdApi";
import { ctfdApi } from "../../services/ctfdApi";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";

type TeamSolvePoint = {
  name: string;
  score: number;
};

const buildTeamSolveProgress = (solves: TeamSolve[]): TeamSolvePoint[] => {
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

type TeamMemberView = {
  id: number;
  name: string;
  email?: string;
  score?: number;
};

const normalizeTeamMembers = async (team: Team): Promise<TeamMemberView[]> => {
  const rawMembers = Array.isArray(team.members) ? team.members : [];

  const resolved = await Promise.all(
    rawMembers.map(async (member): Promise<TeamMemberView | null> => {
      if (typeof member === "number") {
        try {
          const userRes = await ctfdApi.getUser(member);
          const user = userRes.data as User;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            score: user.score,
          };
        } catch {
          return null;
        }
      }

      if (member && typeof member === "object") {
        return {
          id: member.id,
          name: member.name,
          email: member.email,
          score: member.score,
        };
      }

      return null;
    }),
  );

  return resolved.filter((member): member is TeamMemberView => Boolean(member));
};

export function PublicTeamProfile() {
  const { teamId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberView[]>([]);
  const [solves, setSolves] = useState<TeamSolve[]>([]);
  const [awards, setAwards] = useState<TeamAward[]>([]);

  useEffect(() => {
    const parsed = Number(teamId);
    if (!Number.isFinite(parsed)) {
      setError("Invalid team profile id");
      setLoading(false);
      return;
    }

    const loadTeamProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await ctfdApi.getTeam(parsed);
        const teamData = response.data || null;

        if (!teamData) {
          setTeam(null);
          setMembers([]);
          return;
        }

        const resolvedMembers = await normalizeTeamMembers(teamData);
        setTeam(teamData);
        setMembers(resolvedMembers);

        const [solvesResponse, awardsResponse] = await Promise.all([
          ctfdApi
            .getTeamSolves(parsed)
            .catch(() => ({ data: [] as TeamSolve[] })),
          ctfdApi
            .getTeamAwards(parsed)
            .catch(() => ({ data: [] as TeamAward[] })),
        ]);

        setSolves(
          Array.isArray(solvesResponse.data) ? solvesResponse.data : [],
        );
        setAwards(
          Array.isArray(awardsResponse.data) ? awardsResponse.data : [],
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load team profile",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTeamProfile();
  }, [teamId]);

  const captain = useMemo(() => {
    if (!team?.captain_id) {
      return null;
    }
    return members.find((member) => member.id === team.captain_id) || null;
  }, [members, team?.captain_id]);

  const teamSolveChartData = useMemo(
    () => buildTeamSolveProgress(solves),
    [solves],
  );

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
                Loading team profile...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-[Rajdhani] text-sm">{error}</p>
            </div>
          ) : !team ? (
            <p className="font-[Rajdhani] text-white/70">Team not found.</p>
          ) : (
            <>
              <h1 className="font-['Cinzel_Decorative'] text-4xl font-bold text-white mb-2">
                {team.name}
              </h1>
              <p className="font-[Rajdhani] text-white/60 mb-6">
                Score: {team.score ?? 0} · Rank: {team.place ?? "—"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                    Members
                  </p>
                  <p className="font-[Rajdhani] text-white text-xl">
                    {members.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                    Captain
                  </p>
                  <p className="font-[Rajdhani] text-white text-xl">
                    {captain?.name || "Unknown"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                    Team ID
                  </p>
                  <p className="font-[Rajdhani] text-white text-xl">
                    {team.id}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80 font-[Rajdhani] text-xs uppercase tracking-wider">
                  Awards: {awards.length}
                </span>
                <span className="px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80 font-[Rajdhani] text-xs uppercase tracking-wider">
                  Solves: {solves.length}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-sm uppercase tracking-wider text-white/60 mb-3">
                    Team Solve Progress
                  </p>
                  {teamSolveChartData.length === 0 ? (
                    <p className="font-[Rajdhani] text-white/60 text-sm">
                      No solves yet.
                    </p>
                  ) : (
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={teamSolveChartData}>
                          <defs>
                            <linearGradient
                              id="teamSolveGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#c084fc"
                                stopOpacity={0.35}
                              />
                              <stop
                                offset="95%"
                                stopColor="#c084fc"
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
                              borderColor: "#c084fc40",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#c084fc"
                            fillOpacity={1}
                            fill="url(#teamSolveGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-sm uppercase tracking-wider text-white/60 mb-3">
                    Team Awards
                  </p>
                  {awards.length === 0 ? (
                    <p className="font-[Rajdhani] text-white/60 text-sm">
                      No awards yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                      {awards.map((award, index) => (
                        <div
                          key={`${award.id ?? "team-award"}-${index}`}
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

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
                <p className="font-[Rajdhani] text-sm uppercase tracking-wider text-white/60 mb-3">
                  Team Solves
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
                          key={`${solve.challenge_id ?? "team-solve"}-${solve.date ?? index}`}
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
                          <span className="font-[Rajdhani] text-[#c084fc] text-sm font-bold shrink-0">
                            +{solve.value ?? solve.challenge?.value ?? 0}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <h2 className="font-[Rajdhani] text-xl text-white mb-4 uppercase tracking-wider">
                Team Members
              </h2>

              {members.length === 0 ? (
                <p className="font-[Rajdhani] text-white/70">
                  No members available.
                </p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-[Rajdhani] text-sm font-bold text-white/90 shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-[Rajdhani] text-white text-lg font-semibold truncate">
                            {member.name}
                            {member.id === team.captain_id && (
                              <span className="ml-2 text-xs text-[#fbbf24] uppercase tracking-wider align-middle">
                                Captain
                              </span>
                            )}
                          </p>
                          <p className="font-[Rajdhani] text-white/60 text-sm">
                            Score: {member.score ?? 0}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/users/${member.id}`}
                        className="px-3 py-2 rounded-lg border border-[#fbbf24]/35 bg-[#fbbf24]/10 text-[#fbbf24] font-[Rajdhani] text-xs uppercase tracking-wider w-full sm:w-auto text-center"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
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
