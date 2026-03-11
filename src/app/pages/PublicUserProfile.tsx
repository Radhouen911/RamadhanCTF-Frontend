import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { User } from "../../services/ctfdApi";
import { ctfdApi } from "../../services/ctfdApi";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";

export function PublicUserProfile() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
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
        const response = await ctfdApi.getUser(parsed);
        setProfile(response.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

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
              <h1 className="font-['Cinzel_Decorative'] text-4xl font-bold text-white mb-6">
                {profile.name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                    Email
                  </p>
                  <p className="font-[Rajdhani] text-white">
                    {profile.email || "Hidden"}
                  </p>
                </div>
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
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-[Rajdhani] text-xs uppercase tracking-wider text-white/50 mb-1">
                    Team ID
                  </p>
                  <p className="font-[Rajdhani] text-white">
                    {profile.team_id ?? "No team"}
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
