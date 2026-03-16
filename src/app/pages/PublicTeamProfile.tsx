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
import { getTeamDetail } from "../../services/archiveDataLoader";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";

type TeamSolvePoint = {
  name: string;
  score: number;
};

const buildTeamSolveProgress = (
  solves: Array<{
    challenge_id: number;
    challenge_name: string;
    value: number;
    category: string;
  }>,
): TeamSolvePoint[] => {
  let runningScore = 0;
  return solves.map((solve, index) => {
    runningScore += solve.value;
    return {
      name: `Solve ${index + 1}`,
      score: runningScore,
    };
  });
};

export function PublicTeamProfile() {
  const { teamId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamDetail, setTeamDetail] = useState<any>(null);

  useEffect(() => {
    const loadTeam = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!teamId) {
          setError("Team ID not provided");
          setLoading(false);
          return;
        }

        const id = parseInt(teamId, 10);
        if (Number.isNaN(id)) {
          setError("Invalid team ID");
          setLoading(false);
          return;
        }

        const detail = await getTeamDetail(id);
        if (!detail) {
          setError("Team not found");
          setLoading(false);
          return;
        }

        setTeamDetail(detail);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load team details",
        );
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [teamId]);

  const teamSolveChartData = useMemo(
    () => (teamDetail ? buildTeamSolveProgress(teamDetail.solves) : []),
    [teamDetail],
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
          ) : !teamDetail ? (
            <p className="font-[Rajdhani] text-white/70">Team not found.</p>
          ) : (
            <>
              <h1 className="font-['Cinzel_Decorative'] text-4xl font-bold text-white mb-2">
                {teamDetail.name}
              </h1>
              <p className="font-[Rajdhani] text-white/60 mb-6">
                Score: {teamDetail.score ?? 0} · Rank: {teamDetail.place ?? "—"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                    Members
                  </p>
                  <p className="font-[Rajdhani] text-white text-xl">
                    {teamDetail.members.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                    Total Solves
                  </p>
                  <p className="font-[Rajdhani] text-white text-xl">
                    {teamDetail.solves.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                    Team ID
                  </p>
                  <p className="font-[Rajdhani] text-white text-xl">
                    {teamDetail.id}
                  </p>
                </div>
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
                    Team Solves
                  </p>
                  {teamDetail.solves.length === 0 ? (
                    <p className="font-[Rajdhani] text-white/60 text-sm">
                      No solves yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                      {teamDetail.solves.map(
                        (
                          solve: {
                            challenge_id: number;
                            challenge_name: string;
                            value: number;
                            category: string;
                          },
                          index: number,
                        ) => (
                          <div
                            key={`${solve.challenge_id}-${index}`}
                            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="font-[Rajdhani] text-white text-sm font-semibold truncate">
                                {solve.challenge_name}
                              </p>
                              <p className="font-[Rajdhani] text-white/60 text-xs">
                                {solve.category}
                              </p>
                            </div>
                            <span className="font-[Rajdhani] text-[#c084fc] text-sm font-bold shrink-0">
                              +{solve.value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>

              <h2 className="font-[Rajdhani] text-xl text-white mb-4 uppercase tracking-wider">
                Team Members
              </h2>

              {teamDetail.members.length === 0 ? (
                <p className="font-[Rajdhani] text-white/70">
                  No members available.
                </p>
              ) : (
                <div className="space-y-3">
                  {teamDetail.members.map(
                    (member: { id: number; name: string; email: string }) => (
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
                            </p>
                            <p className="font-[Rajdhani] text-white/60 text-sm">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ),
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
