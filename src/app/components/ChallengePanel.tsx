import type { LucideProps } from "lucide-react";
import {
  ChevronDown,
  Circle,
  CircleCheck,
  Copy,
  ExternalLink,
  Eye,
  Flag,
  Globe,
  Lightbulb,
  Lock,
  Search,
  Sparkles,
  Star,
  Terminal,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { FC } from "react";
import { useState } from "react";
import { ctfdApi } from "../../services/ctfdApi";
import type { Category, Challenge } from "./data";

type IconFC = FC<LucideProps>;

const iconMap: Record<string, IconFC> = {
  Globe: Globe as IconFC,
  Lock: Lock as IconFC,
  Terminal: Terminal as IconFC,
  Search: Search as IconFC,
  Eye: Eye as IconFC,
  Sparkles: Sparkles as IconFC,
};

const difficultyConfig = {
  Easy: {
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.25)",
  },
  Medium: {
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.25)",
  },
  Hard: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.25)",
  },
};

interface ChallengePanelProps {
  category: Category;
  solvedIds: Set<number>;
  onSolve: (id: number) => void;
  onClose: () => void;
  onChallengeUpdate?: () => void;
}

function ChallengeCard({
  challenge,
  isSolved,
  onSolve,
  categoryColor,
  onChallengeUpdate,
}: {
  challenge: Challenge;
  isSolved: boolean;
  onSolve: () => void;
  categoryColor: string;
  onChallengeUpdate?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [flagInput, setFlagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const diff = difficultyConfig[challenge.difficulty];

  const [containerStatus, setContainerStatus] = useState<
    "idle" | "spawning" | "active"
  >("idle");
  const [containerInfo, setContainerInfo] = useState<{
    ip: string;
    port: number;
  } | null>(null);

  const handleFlagSubmit = async () => {
    if (!flagInput.trim() || submitting) return;

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await ctfdApi.submitFlag(challenge.id, flagInput.trim());

      if (response.success) {
        setSubmitMessage({ type: "success", text: "Correct flag! Well done!" });
        setFlagInput("");
        setShowFlag(false);
        onSolve(); // Update local state
        if (onChallengeUpdate) {
          onChallengeUpdate(); // Refresh challenges from API
        }
      } else {
        setSubmitMessage({
          type: "error",
          text: response.data?.message || "Incorrect flag. Try again!",
        });
      }
    } catch (error) {
      console.error("Flag submission error:", error);
      setSubmitMessage({
        type: "error",
        text: "Failed to submit flag. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSpawnContainer = () => {
    setContainerStatus("spawning");
    setTimeout(() => {
      setContainerStatus("active");
      setContainerInfo({
        ip: "10.10.14.23",
        port: Math.floor(Math.random() * 1000) + 3000,
      });
    }, 2000);
  };

  return (
    <div
      style={{
        background: isSolved
          ? "linear-gradient(135deg, rgba(52,211,153,0.05), rgba(6,11,21,0.6))"
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${isSolved ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "8px",
        backdropFilter: "blur(10px)",
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        style={{
          borderBottom: expanded ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-shrink-0">
          {isSolved ? (
            <CircleCheck
              size={16}
              color="#34d399"
              style={{ filter: "drop-shadow(0 0 4px #34d399)" }}
            />
          ) : (
            <Circle size={16} color="rgba(255,255,255,0.2)" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "14px",
              fontWeight: "600",
              color: isSolved
                ? "rgba(255,255,255,0.5)"
                : "rgba(255,255,255,0.9)",
              letterSpacing: "0.5px",
              textDecoration: isSolved ? "line-through" : "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {challenge.name}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: diff.color,
              background: diff.bg,
              border: `1px solid ${diff.border}`,
              borderRadius: "6px",
              padding: "2px 7px",
            }}
          >
            {challenge.difficulty}
          </span>
          <span
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "13px",
              fontWeight: "700",
              color: categoryColor,
              minWidth: "38px",
              textAlign: "right",
            }}
          >
            {challenge.points}
          </span>
          <ChevronDown
            size={14}
            color="rgba(255,255,255,0.3)"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </div>
      </div>

      {/* Expandable content — CSS max-height transition, no motion height:auto */}
      <div
        style={{
          maxHeight: expanded ? "600px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div className="px-4 py-3">
          <p
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "13px",
              color: "rgba(255,255,255,0.55)",
              lineHeight: "1.6",
              marginBottom: "12px",
            }}
          >
            {challenge.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.5px",
                  color: "rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "4px",
                  padding: "1px 7px",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <Users size={12} color="rgba(255,255,255,0.3)" />
              <span
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {challenge.solves} solves
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star size={12} color="rgba(255,255,255,0.3)" />
              <span
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {challenge.points} pts
              </span>
            </div>
          </div>

          {challenge.hint && (
            <div
              className="flex items-start gap-2 p-2.5 rounded-lg mb-3"
              style={{
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.15)",
              }}
            >
              <Lightbulb
                size={13}
                color="rgba(251,191,36,0.7)"
                className="flex-shrink-0 mt-0.5"
              />
              <p
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "12px",
                  color: "rgba(251,191,36,0.65)",
                  lineHeight: "1.5",
                }}
              >
                {challenge.hint}
              </p>
            </div>
          )}

          {challenge.hasContainer && !isSolved && (
            <div className="mb-4">
              {containerStatus === "idle" && (
                <button
                  onClick={handleSpawnContainer}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white uppercase transition-all rounded-lg hover:brightness-110"
                  style={{
                    background: `linear-gradient(135deg, ${categoryColor}40, ${categoryColor}20)`,
                    border: `1px solid ${categoryColor}60`,
                    fontFamily: "Rajdhani, sans-serif",
                    letterSpacing: "1px",
                  }}
                >
                  <Terminal size={14} />
                  Spawn Container
                </button>
              )}

              {containerStatus === "spawning" && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <div
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: categoryColor,
                      borderTopColor: "transparent",
                    }}
                  />
                  <span className="text-xs text-white/60 font-[Rajdhani] uppercase tracking-wider">
                    Initializing Environment...
                  </span>
                </div>
              )}

              {containerStatus === "active" && containerInfo && (
                <div className="p-3 rounded-lg bg-[#0a0f1c] border border-white/10 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-400 font-[Rajdhani] uppercase tracking-wider font-bold">
                        Instance Active
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30 font-[Rajdhani]">
                      Expires in 59:20
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-white/80 bg-black/40 p-2 rounded border border-white/5">
                    <span className="select-all">
                      nc {containerInfo.ip} {containerInfo.port}
                    </span>
                    <button
                      className="ml-auto text-white/40 hover:text-white transition-colors"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `nc ${containerInfo.ip} ${containerInfo.port}`,
                        )
                      }
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isSolved ? (
            <div>
              {showFlag ? (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="CTF{flag_here}"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !submitting) {
                          handleFlagSubmit();
                        }
                      }}
                      disabled={submitting}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        border: `1px solid ${categoryColor}80`,
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontFamily: "Rajdhani, sans-serif",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.8)",
                        outline: "none",
                        opacity: submitting ? 0.6 : 1,
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleFlagSubmit}
                      disabled={!flagInput.trim() || submitting}
                      style={{
                        background: `linear-gradient(135deg, ${categoryColor}30, ${categoryColor}50)`,
                        border: `1px solid ${categoryColor}60`,
                        borderRadius: "8px",
                        padding: "8px 16px",
                        fontFamily: "Rajdhani, sans-serif",
                        fontSize: "12px",
                        fontWeight: "700",
                        letterSpacing: "1px",
                        color: categoryColor,
                        cursor:
                          submitting || !flagInput.trim()
                            ? "not-allowed"
                            : "pointer",
                        textTransform: "uppercase",
                        opacity: submitting || !flagInput.trim() ? 0.6 : 1,
                      }}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>

                  {/* Submit Message */}
                  {submitMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 rounded-lg"
                      style={{
                        background:
                          submitMessage.type === "success"
                            ? "rgba(52,211,153,0.1)"
                            : "rgba(248,113,113,0.1)",
                        border:
                          submitMessage.type === "success"
                            ? "1px solid rgba(52,211,153,0.3)"
                            : "1px solid rgba(248,113,113,0.3)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "Rajdhani, sans-serif",
                          fontSize: "12px",
                          color:
                            submitMessage.type === "success"
                              ? "#34d399"
                              : "#f87171",
                          margin: 0,
                        }}
                      >
                        {submitMessage.text}
                      </p>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFlag(true)}
                    style={{
                      flex: 1,
                      background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}35)`,
                      border: `1px solid ${categoryColor}50`,
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontFamily: "Rajdhani, sans-serif",
                      fontSize: "12px",
                      fontWeight: "700",
                      letterSpacing: "1.5px",
                      color: categoryColor,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Flag size={12} /> Submit Flag
                  </button>
                  <button
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ExternalLink size={13} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.2)",
              }}
            >
              <CircleCheck size={13} color="#34d399" />
              <span
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  color: "#34d399",
                  textTransform: "uppercase",
                }}
              >
                Solved — {challenge.points} pts earned
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Confetti } from "./ui/Confetti";

// ... (imports remain same, I will keep them but need to be careful with replace)

export function ChallengePanel({
  category,
  solvedIds,
  onSolve,
  onClose,
  onChallengeUpdate,
}: ChallengePanelProps) {
  const IconComp = iconMap[category.iconName];
  const totalPts = category.challenges.reduce((s, c) => s + c.points, 0);
  const earnedPts = category.challenges
    .filter((c) => solvedIds.has(c.id))
    .reduce((s, c) => s + c.points, 0);
  const solvedCount = category.challenges.filter((c) =>
    solvedIds.has(c.id),
  ).length;
  const progressPct = (solvedCount / category.challenges.length) * 100;

  // Track solve state to trigger confetti
  const [justSolved, setJustSolved] = useState(false);
  const handleSolve = (id: number) => {
    onSolve(id);
    if (!solvedIds.has(id)) {
      setJustSolved(true);
      setTimeout(() => setJustSolved(false), 1500);
    }
  };

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background: "rgba(8, 14, 28, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderLeft: `1px solid ${category.color}30`,
        boxShadow: `-8px 0 40px rgba(0,0,0,0.4)`,
      }}
    >
      <Confetti active={justSolved} color={category.color} />

      {/* Panel header */}
      <div
        style={{
          borderBottom: `1px solid ${category.color}25`,
          padding: "20px 20px 16px",
          background: `linear-gradient(135deg, ${category.darkColor}40, transparent)`,
          flexShrink: 0,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: `${category.color}18`,
                border: `1px solid ${category.color}35`,
                boxShadow: `0 0 16px ${category.color}20`,
              }}
            >
              <IconComp size={20} color={category.color} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: category.color,
                  letterSpacing: "1px",
                  textShadow: `0 0 20px ${category.color}60`,
                }}
              >
                {category.name}
              </h2>
              <p
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginTop: "1px",
                }}
              >
                {category.challenges.length} challenges
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 hover:bg-white/10"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.04)",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          {[
            {
              label: "Solved",
              value: `${solvedCount}/${category.challenges.length}`,
            },
            { label: "Points", value: `${earnedPts}/${totalPts}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 px-3 py-2 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: category.color,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  fontSize: "10px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                  marginTop: "3px",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              style={{
                fontFamily: "Rajdhani, sans-serif",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Progress
            </span>
            <span
              style={{
                fontFamily: "Rajdhani, sans-serif",
                fontSize: "11px",
                fontWeight: "600",
                color: category.color,
              }}
            >
              {Math.round(progressPct)}%
            </span>
          </div>
          <div
            style={{
              height: "4px",
              borderRadius: "4px",
              background: "rgba(255,255,255,0.07)",
              overflow: "hidden",
            }}
          >
            <motion.div
              layoutId={`prog-${category.id}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              style={{
                height: "100%",
                borderRadius: "4px",
                background: `linear-gradient(90deg, ${category.darkColor}, ${category.color})`,
                boxShadow: `0 0 8px ${category.color}50`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Challenges list */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        style={{ padding: "16px 20px" }}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${category.color}40;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${category.color}60;
          }
        `}</style>
        <AnimatePresence mode="popLayout">
          {category.challenges.map((challenge, idx) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              <ChallengeCard
                challenge={challenge}
                isSolved={solvedIds.has(challenge.id)}
                onSolve={() => handleSolve(challenge.id)}
                categoryColor={category.color}
                onChallengeUpdate={onChallengeUpdate}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
