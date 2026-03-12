import {
  Copy,
  Crown,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Team } from "../../services/ctfdApi";
import { ctfdApi } from "../../services/ctfdApi";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";
import { useAuth } from "../context/AuthContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isDev = (import.meta as any).env?.DEV === true;
const debugLog = (...args: unknown[]) => {
  if (isDev) {
    console.log(...args);
  }
};

interface TeamMember {
  id: number;
  name: string;
  email?: string;
  score?: number;
}

export function TeamManagement() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    checkAuthStatus,
  } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisbandModal, setShowDisbandModal] = useState(false);
  const [showCaptainModal, setShowCaptainModal] = useState(false);

  // Form states
  const [createTeamName, setCreateTeamName] = useState("");
  const [createTeamPassword, setCreateTeamPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  const [joinTeamName, setJoinTeamName] = useState("");
  const [joinTeamPassword, setJoinTeamPassword] = useState("");
  const [joinInviteCode, setJoinInviteCode] = useState("");
  const [showJoinPassword, setShowJoinPassword] = useState(false);

  const [editTeamName, setEditTeamName] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editAffiliation, setEditAffiliation] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editNewTeamPassword, setEditNewTeamPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showEditNewPassword, setShowEditNewPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [selectedCaptainId, setSelectedCaptainId] = useState("");
  const [captainName, setCaptainName] = useState<string>("");
  const [inviteLink, setInviteLink] = useState("");

  // Loading states
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [captainSaving, setCaptainSaving] = useState(false);
  const [disbanding, setDisbanding] = useState(false);
  const [inviteGenerating, setInviteGenerating] = useState(false);

  const isTeamCaptain =
    currentTeam && user && currentTeam.captain_id === user.id;

  const normalizeMembers = async (team: Team): Promise<TeamMember[]> => {
    const rawMembers = Array.isArray(team.members) ? team.members : [];
    const resolved = await Promise.all(
      rawMembers.map(async (member): Promise<TeamMember | null> => {
        if (typeof member === "number") {
          try {
            const response = await ctfdApi.getUser(member);
            return {
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              score: response.data.score,
            };
          } catch {
            return {
              id: member,
              name: `User #${member}`,
            };
          }
        }

        if (
          member &&
          typeof member === "object" &&
          typeof member.id === "number"
        ) {
          return {
            id: member.id,
            name: member.name || `User #${member.id}`,
            email: member.email,
            score: member.score,
          };
        }

        return null;
      }),
    );

    return resolved.filter((member): member is TeamMember => Boolean(member));
  };

  const resolveCaptainId = (team: Team): number | null => {
    if (typeof team.captain_id === "number") {
      return team.captain_id;
    }

    if (typeof team.captain === "number") {
      return team.captain;
    }

    if (
      team.captain &&
      typeof team.captain === "object" &&
      typeof team.captain.id === "number"
    ) {
      return team.captain.id;
    }

    return null;
  };

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsResponse, currentUserResponse] = await Promise.all([
        ctfdApi.getTeams({ perPage: 100 }),
        ctfdApi.getCurrentUser(),
      ]);

      setAllTeams(teamsResponse.data || []);

      const currentUser = currentUserResponse.data;
      if (currentUser?.team_id) {
        const teamResponse = await ctfdApi.getTeam(currentUser.team_id);
        const teamData = teamResponse.data || null;
        const resolvedCaptainId = teamData ? resolveCaptainId(teamData) : null;
        const resolvedMembers = teamData
          ? await normalizeMembers(teamData)
          : [];

        const team: Team | null = teamData
          ? {
              ...teamData,
              captain_id: resolvedCaptainId ?? undefined,
              members_count:
                typeof teamData.members_count === "number"
                  ? teamData.members_count
                  : resolvedMembers.length,
              members: resolvedMembers,
            }
          : null;

        setCurrentTeam(team);
        setTeamMembers(resolvedMembers);

        setEditTeamName(team?.name || "");
        setEditWebsite(team?.website || "");
        setEditAffiliation(team?.affiliation || "");
        setEditCountry(team?.country || "");
        if (typeof team?.captain_id === "number") {
          const captain = resolvedMembers.find(
            (member) => member.id === team.captain_id,
          );
          setCaptainName(captain?.name || `User #${team.captain_id}`);
        } else {
          setCaptainName("");
        }
      } else {
        setCurrentTeam(null);
        setTeamMembers([]);
        setCaptainName("");
      }
    } catch (err) {
      debugLog("[TeamManagement] Error loading team data:", err);
      setError(err instanceof Error ? err.message : "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load teams and current team data
  useEffect(() => {
    if (!isAuthenticated) return;
    loadTeamData();
  }, [isAuthenticated]);

  const handleCreateTeam = async () => {
    if (!createTeamName.trim()) {
      setError("Team name is required");
      return;
    }

    try {
      setCreatingTeam(true);
      setError(null);
      await ctfdApi.createTeam(
        createTeamName.trim(),
        createTeamPassword.trim() || undefined,
      );
      await checkAuthStatus();
      await loadTeamData();
      setShowCreateModal(false);
      setCreateTeamName("");
      setCreateTeamPassword("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleJoinTeam = async () => {
    // If an invite code or full invite URL is provided, redirect to CTFd's native invite page
    if (joinInviteCode.trim()) {
      let code = joinInviteCode.trim();
      try {
        const url = new URL(code);
        code = url.searchParams.get("code") || code;
      } catch {
        // not a URL, treat as raw code
      }
      window.location.href = `/teams/invite?code=${encodeURIComponent(code)}`;
      return;
    }

    if (!joinTeamName.trim()) {
      setError("Team name or invite code is required");
      return;
    }

    try {
      setJoiningTeam(true);
      setError(null);
      await ctfdApi.joinTeam({
        teamName: joinTeamName.trim(),
        password: joinTeamPassword.trim() || undefined,
      });
      await checkAuthStatus();
      await loadTeamData();
      setShowJoinModal(false);
      setJoinTeamName("");
      setJoinTeamPassword("");
      setJoinInviteCode("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join team");
    } finally {
      setJoiningTeam(false);
    }
  };

  const handleUpdateTeamSettings = async () => {
    if (!currentTeam || !editTeamName.trim()) {
      setError("Team name is required");
      return;
    }

    if (editNewTeamPassword.trim() && !editConfirmPassword.trim()) {
      setError(
        "Confirm current team password is required to set a new team password",
      );
      return;
    }

    try {
      setSettingsSaving(true);
      setError(null);
      await ctfdApi.updateTeamSettings(currentTeam.id, {
        name: editTeamName.trim(),
        website: editWebsite.trim(),
        affiliation: editAffiliation.trim(),
        country: editCountry.trim(),
        password: editNewTeamPassword.trim() || undefined,
        confirm: editConfirmPassword.trim() || undefined,
      });
      await loadTeamData();
      setShowEditModal(false);
      setEditNewTeamPassword("");
      setEditConfirmPassword("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update team settings",
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleTransferCaptain = async () => {
    if (!selectedCaptainId) {
      setError("Please select a team member to become captain");
      return;
    }
    const captainId = Number(selectedCaptainId);
    if (!Number.isFinite(captainId)) {
      setError("Invalid captain selection");
      return;
    }
    try {
      setCaptainSaving(true);
      setError(null);
      await ctfdApi.transferTeamCaptain(captainId);
      await loadTeamData();
      setShowCaptainModal(false);
      setSelectedCaptainId("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to transfer captain",
      );
    } finally {
      setCaptainSaving(false);
    }
  };

  const handleDisbandTeam = async () => {
    try {
      setDisbanding(true);
      setError(null);
      await ctfdApi.disbandTeam();
      await checkAuthStatus();
      await loadTeamData();
      setShowDisbandModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disband team");
    } finally {
      setDisbanding(false);
    }
  };

  const handleGenerateInviteLink = async () => {
    try {
      setInviteGenerating(true);
      setError(null);
      const code = await ctfdApi.generateTeamInviteCode();
      const link = `${window.location.origin}/teams/invite?code=${encodeURIComponent(code)}`;
      setInviteLink(link);
      await navigator.clipboard.writeText(link);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate invite link",
      );
    } finally {
      setInviteGenerating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative">
        <StarField />
        <IslamicPattern />
        <div className="relative z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fbbf24]"></div>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10">
        <Header />

        <main className="pt-32 px-4 pb-20 max-w-6xl mx-auto flex-1 w-full">
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-300 font-[Rajdhani] text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
              >
                <p className="text-emerald-300 font-[Rajdhani] text-sm">
                  ✓ Operation successful!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!currentTeam ? (
            // No Team State
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <div className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/5 to-transparent pointer-events-none" />

                  <div className="relative">
                    <h1 className="font-['Cinzel_Decorative'] text-4xl font-bold text-white mb-3">
                      Team Management
                    </h1>
                    <p className="font-[Rajdhani] text-slate-300 text-sm tracking-wide mb-8">
                      Create a new team or join an existing one to compete.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#fbbf24] to-[#d97706] hover:from-[#f59e0b] hover:to-[#c97200] text-black font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg transition-all shadow-lg"
                      >
                        <Plus size={18} />
                        Create Team
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowJoinModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 hover:bg-white/10 text-white font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg transition-all"
                      >
                        <Users size={18} />
                        Join Team
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Available Teams */}
              <div>
                <h2
                  className="font-['Cinzel'] text-2xl font-bold text-white mb-6"
                  style={{ letterSpacing: "2px" }}
                >
                  Available Teams
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTeams.slice(0, 9).map((team, idx) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                    >
                      <div className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 hover:border-[#fbbf24]/50 rounded-2xl p-6 shadow-lg transition-all group">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/3 to-transparent rounded-2xl pointer-events-none group-hover:from-[#fbbf24]/8 transition-all" />

                        <div className="relative">
                          <h3 className="font-['Cinzel'] text-xl font-bold text-white mb-2">
                            {team.name}
                          </h3>
                          <p className="font-[Rajdhani] text-slate-400 text-sm mb-4">
                            {team.members_count || 0} {" "}
                            {team.members_count === 1 ? "member" : "members"} •{" "}
                            {team.score} points
                          </p>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setJoinTeamName(team.name);
                              setShowJoinModal(true);
                            }}
                            className="w-full py-2 bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] font-[Rajdhani] font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-[#fbbf24]/20 transition-all"
                          >
                            Join Team
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Current Team State
            <>
              {/* Team Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/5 to-transparent pointer-events-none" />

                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <h1 className="font-['Cinzel_Decorative'] text-4xl font-bold text-white mb-2">
                        {currentTeam.name}
                      </h1>
                      <p className="font-[Rajdhani] text-slate-400 text-sm tracking-wide">
                        {currentTeam.members_count || 0} {" "}
                        {currentTeam.members_count === 1 ? "member" : "members"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isTeamCaptain && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowEditModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#c084fc]/10 border border-[#c084fc]/30 text-[#c084fc] font-[Rajdhani] font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-[#c084fc]/20 transition-all"
                        >
                          <Settings size={14} />
                          Team Settings
                        </motion.button>
                      )}

                      {isTeamCaptain && teamMembers.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowCaptainModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] font-[Rajdhani] font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-[#fbbf24]/20 transition-all"
                        >
                          <Crown size={14} />
                          Transfer Captain
                        </motion.button>
                      )}

                      {isTeamCaptain && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowDisbandModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 font-[Rajdhani] font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 size={14} />
                          Disband Team
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Team Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                    <div className="text-center">
                      <p className="font-[Rajdhani] text-slate-400 text-xs uppercase tracking-wider mb-1">
                        Rank
                      </p>
                      <p className="font-['Cinzel'] text-3xl font-bold text-[#fbbf24]">
                        {currentTeam.place || "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-[Rajdhani] text-slate-400 text-xs uppercase tracking-wider mb-1">
                        Score
                      </p>
                      <p className="font-['Cinzel'] text-3xl font-bold text-[#fbbf24]">
                        {currentTeam.score}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-[Rajdhani] text-slate-400 text-xs uppercase tracking-wider mb-1">
                        Members
                      </p>
                      <p className="font-['Cinzel'] text-3xl font-bold text-[#fbbf24]">
                        {currentTeam.members_count || 0}
                      </p>
                    </div>
                  </div>

                  {/* Team Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="font-[Rajdhani] text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                        Website
                      </p>
                      <p className="font-[Rajdhani] text-sm text-white">
                        {currentTeam.website?.trim() || "Not set"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="font-[Rajdhani] text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                        Affiliation
                      </p>
                      <p className="font-[Rajdhani] text-sm text-white">
                        {currentTeam.affiliation?.trim() || "Not set"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="font-[Rajdhani] text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                        Country
                      </p>
                      <p className="font-[Rajdhani] text-sm text-white">
                        {currentTeam.country?.trim() || "Not set"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="font-[Rajdhani] text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                        Captain
                      </p>
                      <p className="font-[Rajdhani] text-sm text-white">
                        {captainName || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Invite Link Generator */}
              {isTeamCaptain && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mb-8"
                >
                  <div className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#c084fc]/3 to-transparent pointer-events-none" />

                    <div className="relative">
                      <h2
                        className="font-['Cinzel'] text-xl font-bold text-white mb-4"
                        style={{ letterSpacing: "1px" }}
                      >
                        Invite Members
                      </h2>
                      <p className="font-[Rajdhani] text-slate-400 text-sm mb-4">
                        Generate a secure invite link for new members to join your team:
                      </p>
                      <div className="flex flex-col md:flex-row gap-3">
                        <input
                          readOnly
                          value={inviteLink}
                          placeholder="Click Generate to create an invite link"
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white/70 placeholder-slate-500 font-[Rajdhani] text-sm rounded-lg focus:outline-none"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleGenerateInviteLink}
                          disabled={inviteGenerating}
                          className="px-4 py-3 bg-[#c084fc]/10 border border-[#c084fc]/30 text-[#c084fc] font-[Rajdhani] font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-[#c084fc]/20 transition-all disabled:opacity-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <LogOut size={16} />
                            {inviteGenerating ? "Generating..." : "Generate"}
                          </span>
                        </motion.button>
                        {inviteLink && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              navigator.clipboard.writeText(inviteLink);
                              setShowSuccess(true);
                              setTimeout(() => setShowSuccess(false), 2000);
                            }}
                            className="px-4 py-3 bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] font-[Rajdhani] font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-[#fbbf24]/20 transition-all"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Copy size={16} />
                              Copy
                            </span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Team Members */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <div className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/3 to-transparent pointer-events-none" />

                  <div className="relative">
                    <h2
                      className="font-['Cinzel'] text-xl font-bold text-white mb-4"
                      style={{ letterSpacing: "1px" }}
                    >
                      Team Members ({teamMembers.length})
                    </h2>
                    <div className="space-y-3">
                      {teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#fbbf24]/30 transition-all"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-['Cinzel'] text-white font-bold">
                                  {member.name}
                                </p>
                                {member.id === currentTeam?.captain_id && (
                                  <span className="text-[#fbbf24]">
                                    <Crown size={14} />
                                  </span>
                                )}
                              </div>
                              {member.email && (
                                <p className="font-[Rajdhani] text-slate-400 text-sm">
                                  {member.email}
                                </p>
                              )}
                            </div>
                            {member.score !== undefined && (
                              <div className="text-right">
                                <p className="font-[Rajdhani] text-[#fbbf24] font-bold">
                                  {member.score}
                                </p>
                                <p className="font-[Rajdhani] text-slate-400 text-xs">
                                  points
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 font-[Rajdhani]">
                          No members found
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </main>

        <Footer />
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f20]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/3 to-transparent pointer-events-none" />

              <div className="relative">
                <h2 className="font-['Cinzel_Decorative'] text-3xl font-bold text-white mb-6">
                  Create Team
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={createTeamName}
                      onChange={(e) => setCreateTeamName(e.target.value)}
                      placeholder="Enter team name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Team Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCreatePassword ? "text" : "password"}
                        value={createTeamPassword}
                        onChange={(e) => setCreateTeamPassword(e.target.value)}
                        placeholder="Optional team password"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCreatePassword(!showCreatePassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showCreatePassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-white/10">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateTeamName("");
                      setCreateTeamPassword("");
                    }}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateTeam}
                    disabled={creatingTeam}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:from-[#f59e0b] hover:to-[#c97200] disabled:opacity-50 transition-all"
                  >
                    {creatingTeam ? "Creating..." : "Create"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Team Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f20]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/3 to-transparent pointer-events-none" />

              <div className="relative">
                <h2 className="font-['Cinzel_Decorative'] text-3xl font-bold text-white mb-6">
                  Join Team
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Invite Link or Code
                    </label>
                    <input
                      type="text"
                      value={joinInviteCode}
                      onChange={(e) => setJoinInviteCode(e.target.value)}
                      placeholder="Paste invite link or code (e.g. eyJ...)" 
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                    />
                    <p className="mt-1 font-[Rajdhani] text-xs text-slate-500">
                      OR enter team name + password below
                    </p>
                  </div>

                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={joinTeamName}
                      onChange={(e) => setJoinTeamName(e.target.value)}
                      placeholder="Enter team name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Team Password
                    </label>
                    <div className="relative">
                      <input
                        type={showJoinPassword ? "text" : "password"}
                        value={joinTeamPassword}
                        onChange={(e) => setJoinTeamPassword(e.target.value)}
                        placeholder="Password (if required)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowJoinPassword(!showJoinPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showJoinPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-white/10">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowJoinModal(false);
                      setJoinTeamName("");
                      setJoinTeamPassword("");
                      setJoinInviteCode("");
                    }}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoinTeam}
                    disabled={joiningTeam}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:from-[#f59e0b] hover:to-[#c97200] disabled:opacity-50 transition-all"
                  >
                    {joiningTeam ? "Joining..." : "Join"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Team Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f20]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden my-8"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/3 to-transparent pointer-events-none" />

              <div className="relative">
                <h2 className="font-['Cinzel_Decorative'] text-3xl font-bold text-white mb-6">
                  Edit Team Settings
                </h2>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Affiliation
                    </label>
                    <input
                      type="text"
                      value={editAffiliation}
                      onChange={(e) => setEditAffiliation(e.target.value)}
                      placeholder="Your organization"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      New Team Password
                    </label>
                    <div className="relative">
                      <input
                        type={showEditNewPassword ? "text" : "password"}
                        value={editNewTeamPassword}
                        onChange={(e) => setEditNewTeamPassword(e.target.value)}
                        placeholder="Optional new team password"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowEditNewPassword(!showEditNewPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showEditNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-[Rajdhani] text-xs uppercase text-slate-300 tracking-wider block mb-2">
                      Confirm Current Team Password
                    </label>
                    <div className="relative">
                      <input
                        type={showEditConfirmPassword ? "text" : "password"}
                        value={editConfirmPassword}
                        onChange={(e) => setEditConfirmPassword(e.target.value)}
                        placeholder="Required when changing team password"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowEditConfirmPassword(!showEditConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showEditConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-white/10">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdateTeamSettings}
                    disabled={settingsSaving}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#c084fc] to-[#9333ea] text-white font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:from-[#c9a3f5] hover:to-[#a855f7] transition-all disabled:opacity-50"
                  >
                    {settingsSaving ? "Saving..." : "Update"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfer Captain Modal */}
      <AnimatePresence>
        {showCaptainModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f20]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#fbbf24]/3 to-transparent pointer-events-none" />
              <div className="relative">
                <h2 className="font-['Cinzel_Decorative'] text-3xl font-bold text-white mb-2">
                  Transfer Captain
                </h2>
                <p className="font-[Rajdhani] text-slate-400 text-sm mb-6">
                  Select a member to become the new captain of {currentTeam?.name}.
                </p>
                <select
                  value={selectedCaptainId}
                  onChange={(e) => setSelectedCaptainId(e.target.value)}
                  className="w-full px-4 py-3 mb-6 bg-white/5 border border-white/10 text-white font-[Rajdhani] rounded-lg focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                  style={{ colorScheme: "dark", backgroundColor: "#0a0f20", color: "#ffffff" }}
                >
                  <option value="" style={{ backgroundColor: "#0a0f20", color: "#ffffff" }}>Select a member...</option>
                  {teamMembers
                    .filter((m) => m.id !== currentTeam?.captain_id)
                    .map((m) => (
                      <option key={m.id} value={m.id} style={{ backgroundColor: "#0a0f20", color: "#ffffff" }}>
                        {m.name}
                      </option>
                    ))}
                </select>
                <div className="flex gap-3 pt-6 border-t border-white/10">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowCaptainModal(false); setSelectedCaptainId(""); }}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTransferCaptain}
                    disabled={!selectedCaptainId || captainSaving}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:from-[#f59e0b] hover:to-[#c97200] disabled:opacity-50 transition-all"
                  >
                    {captainSaving ? "Transferring..." : "Transfer"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disband Team Modal */}
      <AnimatePresence>
        {showDisbandModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f20]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/3 to-transparent pointer-events-none" />
              <div className="relative">
                <h2 className="font-['Cinzel_Decorative'] text-3xl font-bold text-white mb-2">
                  Disband Team?
                </h2>
                <p className="font-[Rajdhani] text-slate-400 text-sm mb-6">
                  This will permanently disband <strong className="text-white">{currentTeam?.name}</strong> and remove all members. This cannot be undone.
                </p>
                <div className="flex gap-3 pt-6 border-t border-white/10">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDisbandModal(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDisbandTeam}
                    disabled={disbanding}
                    className="flex-1 px-4 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 font-[Rajdhani] font-bold uppercase text-sm tracking-wider rounded-lg hover:bg-red-500/30 disabled:opacity-50 transition-all"
                  >
                    {disbanding ? "Disbanding..." : "Disband"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
