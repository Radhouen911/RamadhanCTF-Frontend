import {
  Activity,
  Calendar,
  Copy,
  Cpu,
  Flag,
  Globe,
  Key,
  Lock,
  Mail,
  Shield,
  Star,
  Terminal,
  Trophy,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { User as ApiUser, Team } from "../../services/ctfdApi";
import { ctfdApi } from "../../services/ctfdApi";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";
import { VisibilityNotice } from "../components/VisibilityNotice";
import { useAuth } from "../context/AuthContext";
import { canAccessVisibility, useAppConfig } from "../context/ConfigContext";

interface SolveHistoryItem {
  id: number;
  name: string;
  category: string;
  points: number;
  date: string;
}

export function Profile() {
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  const { scoreVisibility, loading: configLoading } = useAppConfig();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [solveHistory, setSolveHistory] = useState<SolveHistoryItem[]>([]);

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [token, setToken] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const canViewScores = canAccessVisibility(scoreVisibility, {
    isAuthenticated,
    isAdmin: Boolean(authUser?.isAdmin),
  });

  useEffect(() => {
    if (authLoading || configLoading) {
      return;
    }

    const loadProfileData = async () => {
      try {
        setLoadingProfile(true);
        setProfileError(null);

        const [meResponse, challengesResponse] = await Promise.all([
          ctfdApi.getCurrentUser(),
          ctfdApi.getChallenges().catch(() => null),
        ]);
        const me = meResponse.data || null;
        setProfile(me);
        setTotalChallenges(challengesResponse?.data?.length ?? 0);

        if (me?.id) {
          try {
            const solvesResponse = canViewScores
              ? await ctfdApi.getUserSolves(me.id)
              : { data: [] };
            const solves = Array.isArray(solvesResponse.data)
              ? solvesResponse.data
              : [];
            setSolvedCount(solves.length);

            const mappedHistory: SolveHistoryItem[] = solves
              .map((solve, idx) => {
                const points = solve.value ?? solve.challenge?.value ?? 0;

                return {
                  id: solve.challenge_id ?? solve.challenge?.id ?? idx,
                  name: solve.challenge?.name || "Unknown Challenge",
                  category: solve.challenge?.category || "Misc",
                  points,
                  date: solve.date ? solve.date.slice(0, 10) : "Unknown date",
                };
              })
              .slice(0, 10);

            setSolveHistory(mappedHistory);
          } catch {
            setSolvedCount(0);
            setSolveHistory([]);
          }
        } else {
          setSolvedCount(0);
          setSolveHistory([]);
        }

        if (me?.team_id) {
          try {
            const teamResponse = await ctfdApi.getTeam(me.team_id);
            setTeam(teamResponse.data || null);
          } catch {
            setTeam(null);
          }
        } else {
          setTeam(null);
        }
      } catch (error) {
        setProfileError(
          error instanceof Error
            ? error.message
            : "Failed to load your profile.",
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfileData();
  }, [authLoading, canViewScores, configLoading, isAuthenticated]);

  const joinedDate = useMemo(() => {
    return "Registered user";
  }, []);

  const handleGenerateToken = async () => {
    if (!authUser?.isAdmin) {
      setTokenError("Only admin users can generate CTF access tokens.");
      return;
    }

    try {
      setGeneratingToken(true);
      setTokenError(null);

      const response = await ctfdApi.generateToken({
        description: "Admin API Token",
        expiration: null,
      });

      if (response.success && response.data) {
        setToken(response.data.value);
        setShowTokenModal(true);
      } else {
        setTokenError("Failed to generate token. Please try again.");
      }
    } catch (error) {
      console.error("Token generation error:", error);
      setTokenError(
        error instanceof Error
          ? error.message
          : "Failed to generate token. Please try again.",
      );
    } finally {
      setGeneratingToken(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback: manually select the text
      const codeElement = document.querySelector("code");
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
      style={{
        background:
          "linear-gradient(160deg, #060b15 0%, #0a0f20 40%, #090d1e 70%, #06090f 100%)",
      }}
    >
      <StarField />
      <IslamicPattern />
      <Header
        totalPoints={canViewScores ? (profile?.score ?? 0) : 0}
        solvedCount={canViewScores ? solvedCount : 0}
      />

      <div className="relative z-10 pt-28 px-4 pb-20 max-w-6xl mx-auto flex-1 w-full">
        {authLoading || configLoading || loadingProfile ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#fbbf24]" />
          </div>
        ) : profileError ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-300 font-[Rajdhani] text-sm">
              {profileError}
            </p>
          </div>
        ) : (
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

                <h2 className="text-2xl font-bold text-white font-[Cinzel] mb-1">
                  {profile?.name || "Unknown User"}
                </h2>
                <p className="text-xs uppercase tracking-widest text-[#fbbf24]/60 font-[Rajdhani] mb-6">
                  {team?.name ? `${team.name} Team` : "No Team"}
                </p>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                    <Mail size={16} className="text-[#fbbf24]" />
                    <span className="text-sm text-white/70 truncate">
                      {profile?.email || "Hidden"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                    <Shield size={16} className="text-[#fbbf24]" />
                    <span className="text-sm text-white/70">
                      {authUser?.isAdmin ? "Admin" : "Member"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                    <Calendar size={16} className="text-[#fbbf24]" />
                    <span className="text-sm text-white/70">{joinedDate}</span>
                  </div>
                </div>

                <button className="w-full mt-6 py-2.5 bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] font-[Rajdhani] font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-[#fbbf24]/20 transition-all">
                  Edit Profile
                </button>

                {authUser?.isAdmin && (
                  <button
                    onClick={handleGenerateToken}
                    disabled={generatingToken}
                    className="w-full mt-3 py-2.5 bg-white/5 border border-white/10 text-white/60 font-[Rajdhani] font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingToken ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key size={14} />
                        Generate Access Token
                      </>
                    )}
                  </button>
                )}

                {tokenError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <p className="text-xs text-red-400 font-[Rajdhani]">
                      {tokenError}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Right Column: Stats & Activity */}
            <div className="md:col-span-3 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Global Rank",
                    value: canViewScores
                      ? profile?.place
                        ? `#${profile.place}`
                        : "—"
                      : "Hidden",
                    icon: Trophy,
                    color: "#fbbf24",
                  },
                  {
                    label: "Total Points",
                    value: canViewScores ? `${profile?.score ?? 0}` : "Hidden",
                    icon: Star,
                    color: "#34d399",
                  },
                  {
                    label: "Challenges Solved",
                    value: canViewScores ? `${solvedCount}` : "Hidden",
                    icon: Flag,
                    color: "#c084fc",
                  },
                  {
                    label: "Completion Rate",
                    value: canViewScores
                      ? totalChallenges > 0
                        ? `${Math.min(100, Math.round((solvedCount / totalChallenges) * 100))}%`
                        : "0%"
                      : "Hidden",
                    icon: Activity,
                    color: "#f472b6",
                  },
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
                    <div className="text-3xl font-bold text-white font-[Rajdhani] mt-4 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-white/40 font-[Rajdhani]">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Solved History */}
              {canViewScores ? (
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
                    {solveHistory.length === 0 && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="font-[Rajdhani] text-white/60">
                          No recent solve activity found.
                        </p>
                      </div>
                    )}

                    {solveHistory.map((solve, i) => (
                      <motion.div
                        key={solve.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2.5 rounded-lg 
                        ${
                          solve.category === "Crypto"
                            ? "bg-purple-500/20 text-purple-400"
                            : solve.category === "Web"
                              ? "bg-blue-500/20 text-blue-400"
                              : solve.category === "Pwn"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                        }`}
                          >
                            {solve.category === "Crypto" ? (
                              <Lock size={18} />
                            ) : solve.category === "Web" ? (
                              <Globe size={18} />
                            ) : solve.category === "Pwn" ? (
                              <Terminal size={18} />
                            ) : (
                              <Cpu size={18} />
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium font-[Rajdhani] text-lg leading-tight group-hover:text-[#fbbf24] transition-colors">
                              {solve.name}
                            </div>
                            <div className="text-white/40 text-xs uppercase tracking-wider mt-1">
                              {solve.category} • {solve.date}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[#fbbf24] font-bold font-[Rajdhani] text-lg">
                            +{solve.points}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <VisibilityNotice
                  title="Your score is hidden"
                  description="Dark hour is active right now. Your score, rank, completion rate, and recent solve activity are hidden until score visibility is restored."
                />
              )}
            </div>
          </div>
        )}
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
                <h3 className="font-[Cinzel] font-bold text-white text-lg">
                  API Access Token
                </h3>
                <button
                  onClick={() => setShowTokenModal(false)}
                  className="transition-colors text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="mb-4 text-sm text-slate-400 font-[Rajdhani]">
                  This is your personal access token. Treat it like a password.
                  It allows you to authenticate with the API programmatically.
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
