import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { ApiChallenge } from "../../services/ctfdApi";
import { ctfdApi } from "../../services/ctfdApi";
import { ChallengePanel } from "../components/ChallengePanel";
import { ChallengeWheel } from "../components/ChallengeWheel";
import type { Category } from "../components/data";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";

// Note: solved challenges are now fetched from CTFd API

// Default colors and icons for different categories
const categoryDefaults = [
  {
    pattern: /web/i,
    iconName: "Globe",
    color: "#60a5fa",
    darkColor: "#1e3a8a",
    midColor: "#3b82f6",
    glowColor: "rgba(96, 165, 250, 0.6)",
  },
  {
    pattern: /crypto/i,
    iconName: "Lock",
    color: "#c084fc",
    darkColor: "#4c1d95",
    midColor: "#9333ea",
    glowColor: "rgba(192, 132, 252, 0.6)",
  },
  {
    pattern: /pwn|binary/i,
    iconName: "Terminal",
    color: "#f87171",
    darkColor: "#7f1d1d",
    midColor: "#dc2626",
    glowColor: "rgba(248, 113, 113, 0.6)",
  },
  {
    pattern: /forensics?/i,
    iconName: "Search",
    color: "#34d399",
    darkColor: "#064e3b",
    midColor: "#059669",
    glowColor: "rgba(52, 211, 153, 0.6)",
  },
  {
    pattern: /rev|reverse/i,
    iconName: "Eye",
    color: "#a78bfa",
    darkColor: "#3c1361",
    midColor: "#7c3aed",
    glowColor: "rgba(167, 139, 250, 0.6)",
  },
  {
    pattern: /misc|other/i,
    iconName: "Sparkles",
    color: "#22d3ee",
    darkColor: "#164e63",
    midColor: "#0891b2",
    glowColor: "rgba(34, 211, 238, 0.6)",
  },
];

// Fallback colors for unknown categories
const fallbackColors = [
  {
    color: "#fb923c",
    darkColor: "#9a3412",
    midColor: "#ea580c",
    glowColor: "rgba(251, 146, 60, 0.6)",
  },
  {
    color: "#a3d977",
    darkColor: "#365314",
    midColor: "#65a30d",
    glowColor: "rgba(163, 217, 119, 0.6)",
  },
  {
    color: "#fbbf24",
    darkColor: "#78350f",
    midColor: "#d97706",
    glowColor: "rgba(251, 191, 36, 0.6)",
  },
];

const getCategoryDefaults = (categoryName: string, index: number) => {
  // Try to match category name with known patterns
  for (const def of categoryDefaults) {
    if (def.pattern.test(categoryName)) {
      return def;
    }
  }

  // Use fallback colors cyclically
  const fallback = fallbackColors[index % fallbackColors.length];
  return {
    iconName: "Sparkles",
    ...fallback,
  };
};

// Decorative crescent + lantern SVG for corners
function CrescentDecor() {
  return (
    <div
      className="absolute top-24 right-6 pointer-events-none hidden lg:block"
      style={{ zIndex: 1, opacity: 0.55 }}
    >
      <svg width="120" height="150" viewBox="0 0 120 150">
        <defs>
          <filter id="deco-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Large crescent */}
        <circle
          cx="60"
          cy="55"
          r="42"
          fill="#fbbf24"
          opacity="0.18"
          filter="url(#deco-glow)"
        />
        <circle cx="60" cy="55" r="38" fill="#fbbf24" opacity="0.12" />
        <circle cx="74" cy="47" r="30" fill="#060b15" opacity="0.95" />
        {/* Stars */}
        <polygon
          points="90,20 92,26 98,26 93,30 95,36 90,32 85,36 87,30 82,26 88,26"
          fill="#fbbf24"
          opacity="0.8"
        />
        <circle cx="100" cy="48" r="2" fill="#fbbf24" opacity="0.6" />
        <circle cx="95" cy="10" r="1.5" fill="#fbbf24" opacity="0.4" />
        {/* Lantern silhouette */}
        <g transform="translate(42, 95)" opacity="0.45">
          <rect x="14" y="0" width="2" height="10" fill="#fbbf24" />
          <ellipse cx="15" cy="12" rx="14" ry="4" fill="#fbbf24" />
          <rect
            x="2"
            y="12"
            width="26"
            height="32"
            rx="4"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />
          <rect
            x="2"
            y="12"
            width="26"
            height="32"
            rx="4"
            fill="#fbbf24"
            opacity="0.06"
          />
          {/* Lantern lines */}
          <line
            x1="15"
            y1="12"
            x2="15"
            y2="44"
            stroke="#fbbf24"
            strokeWidth="0.8"
            opacity="0.5"
          />
          <line
            x1="2"
            y1="28"
            x2="28"
            y2="28"
            stroke="#fbbf24"
            strokeWidth="0.8"
            opacity="0.5"
          />
          <ellipse cx="15" cy="44" rx="14" ry="4" fill="#fbbf24" />
          <rect x="6" y="44" width="18" height="6" rx="2" fill="#fbbf24" />
          {/* Glow from lantern */}
          <ellipse
            cx="15"
            cy="28"
            rx="10"
            ry="10"
            fill="#fbbf24"
            opacity="0.08"
            filter="url(#deco-glow)"
          />
        </g>
      </svg>
    </div>
  );
}

// Small floating stars decoration
function FloatingStars() {
  const stars = [
    { x: "8%", y: "30%", size: 16, delay: 0 },
    { x: "4%", y: "60%", size: 10, delay: 0.5 },
    { x: "92%", y: "65%", size: 12, delay: 1 },
    { x: "88%", y: "45%", size: 8, delay: 1.5 },
    { x: "12%", y: "80%", size: 14, delay: 0.8 },
  ];
  return (
    <>
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: s.x, top: s.y, zIndex: 1 }}
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 20 20">
            <polygon
              points="10,1 12.4,7.6 19.5,7.6 14,12 16.2,18.9 10,15 3.8,18.9 6,12 0.5,7.6 7.6,7.6"
              fill="#fbbf24"
              opacity="0.8"
            />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

// Ambient glow orbs behind the wheel
function AmbientOrbs({ selectedColor }: { selectedColor?: string }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Central glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "600px",
          height: "600px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: selectedColor
            ? `radial-gradient(circle, ${selectedColor}08 0%, transparent 65%)`
            : "radial-gradient(circle, rgba(212,165,32,0.06) 0%, transparent 65%)",
          transition: "background 0.6s ease",
        }}
      />
      {/* Top purple orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: "400px",
          height: "400px",
          left: "20%",
          top: "-10%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
        }}
      />
      {/* Bottom blue orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: "300px",
          height: "300px",
          right: "15%",
          bottom: "-5%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

// Score summary bar
function ScoreBar({
  totalPoints,
  solvedCount,
  totalChallenges,
}: {
  totalPoints: number;
  solvedCount: number;
  totalChallenges: number;
}) {
  const progressPct = (solvedCount / totalChallenges) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.6 }}
      className="flex items-center gap-4 px-5 py-3 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(212,165,32,0.15)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        maxWidth: "460px",
        width: "100%",
        zIndex: 10,
      }}
    >
      {/* Progress ring mini */}
      <div className="relative flex-shrink-0">
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="rgba(212,165,32,0.1)"
            strokeWidth="3"
          />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeDasharray={`${(2 * Math.PI * 18 * progressPct) / 100} ${2 * Math.PI * 18 * (1 - progressPct / 100)}`}
            strokeDashoffset={2 * Math.PI * 18 * 0.25}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.5))" }}
          />
          <text
            x="22"
            y="22"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fbbf24"
            fontSize="10"
            fontFamily="Rajdhani, sans-serif"
            fontWeight="700"
          >
            {Math.round(progressPct)}%
          </text>
        </svg>
      </div>

      {/* Stats */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Overall Progress
          </span>
          <span
            style={{
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "12px",
              fontWeight: "700",
              color: "#fbbf24",
            }}
          >
            {solvedCount}/{totalChallenges} solved
          </span>
        </div>
        <div
          style={{
            height: "3px",
            borderRadius: "3px",
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, delay: 2, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: "3px",
              background: "linear-gradient(90deg, #b8860b, #fbbf24)",
              boxShadow: "0 0 6px rgba(251,191,36,0.5)",
            }}
          />
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <p
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "20px",
            fontWeight: "700",
            color: "#fbbf24",
            lineHeight: 1,
          }}
        >
          {totalPoints.toLocaleString()}
        </p>
        <p
          style={{
            fontFamily: "Rajdhani, sans-serif",
            fontSize: "10px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.45)",
            marginTop: "2px",
          }}
        >
          points
        </p>
      </div>
    </motion.div>
  );
}

export function Challenges() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [solvedIds, setSolvedIds] = useState<Set<number>>(new Set());
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch challenges from CTFd API
  const fetchChallenges = async () => {
    try {
      const response = await ctfdApi.getChallenges();
      const apiChallenges = response.data || [];
      console.log("[Challenges] Raw API response:", response);
      console.log("[Challenges] Challenges count:", apiChallenges.length);
      if (apiChallenges.length > 0) {
        console.log("[Challenges] First challenge sample:", apiChallenges[0]);
      }

      // Fetch individual challenge details to get full descriptions
      const detailedChallenges = await Promise.all(
        apiChallenges.map(async (challenge: ApiChallenge) => {
          try {
            const detailResponse = await ctfdApi.getChallenge(challenge.id);
            console.log(
              `[Challenges] Details for ${challenge.name}:`,
              detailResponse.data,
            );
            return detailResponse.data;
          } catch (error) {
            console.error(
              `[Challenges] Failed to fetch details for challenge ${challenge.id}:`,
              error,
            );
            // Return original challenge if detail fetch fails
            return challenge;
          }
        }),
      );

      // Group challenges by category
      const categoryMap: Record<string, ApiChallenge[]> = {};
      detailedChallenges.forEach((challenge: ApiChallenge) => {
        const cat = challenge.category || "Misc";
        if (!categoryMap[cat]) {
          categoryMap[cat] = [];
        }
        categoryMap[cat].push(challenge);
      });

      // Convert to category format with dynamic colors
      const newCategories: Category[] = Object.entries(categoryMap).map(
        ([categoryName, challenges], index) => {
          const categoryInfo = getCategoryDefaults(categoryName, index);

          const id = categoryName.toLowerCase().replace(/\s+/g, "");
          return {
            id,
            name: categoryName,
            iconName: categoryInfo.iconName,
            color: categoryInfo.color,
            darkColor: categoryInfo.darkColor,
            midColor: categoryInfo.midColor,
            glowColor: categoryInfo.glowColor,
            challenges: challenges.map((c) => ({
              id: c.id,
              name: c.name,
              points: c.value || 0,
              solves: c.solves || 0,
              solved: c.solved_by_me || false,
              description: c.description || "",
              tags: [],
              hasContainer: false,
            })),
          };
        },
      );

      setCategories(newCategories);

      // Update solvedIds based on API response
      const solvedSet = new Set<number>();
      apiChallenges.forEach((challenge: ApiChallenge) => {
        if (challenge.solved_by_me) {
          solvedSet.add(challenge.id);
        }
      });
      setSolvedIds(solvedSet);
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
      // Don't fall back to mock data - show empty state or error
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleCategoryClick = (id: string) => {
    setSelectedCategory((prev) => (prev === id ? null : id));
  };

  const handleSolve = (challengeId: number) => {
    setSolvedIds((prev) => {
      const next = new Set(prev);
      next.add(challengeId);
      return next;
    });
  };

  // Compute per-category solved counts
  const solvedCounts = useMemo(() => {
    const counts: Record<string, { solved: number; total: number }> = {};
    categories.forEach((cat) => {
      const solved = cat.challenges.filter((c) => solvedIds.has(c.id)).length;
      counts[cat.id] = { solved, total: cat.challenges.length };
    });
    return counts;
  }, [solvedIds, categories]);

  // Global stats
  const totalChallenges = categories.reduce(
    (s, c) => s + c.challenges.length,
    0,
  );
  const solvedCount = categories.reduce(
    (s, cat) => s + cat.challenges.filter((c) => solvedIds.has(c.id)).length,
    0,
  );
  const totalPoints = categories
    .flatMap((c) => c.challenges)
    .filter((c) => solvedIds.has(c.id))
    .reduce((s, c) => s + c.points, 0);

  const selectedCat = categories.find((c) => c.id === selectedCategory);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden overflow-y-auto md:overflow-y-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #060b15 0%, #0a0f20 40%, #090d1e 70%, #06090f 100%)",
      }}
    >
      {/* Layer 0: Background effects */}
      <StarField />
      <IslamicPattern />

      {/* Layer 1: Decorative elements */}
      <FloatingStars />
      <CrescentDecor />
      <AmbientOrbs selectedColor={selectedCat?.color} />

      {/* Layer 2: Header */}
      <Header totalPoints={totalPoints} solvedCount={solvedCount} />

      {/* Layer 3: Main content */}
      {loading ? (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-400 rounded-full mx-auto mb-4"
            />
            <p className="font-[Rajdhani] text-amber-400 text-sm tracking-widest uppercase">
              Loading Challenges...
            </p>
          </div>
        </div>
      ) : (
        <div
          className="relative flex-1 flex flex-col"
          style={{ zIndex: 10, paddingTop: "72px" }}
        >
          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-center pt-3 pb-1 px-4"
          >
            <h1
              style={{
                fontFamily: "Cinzel Decorative, serif",
                fontSize: "clamp(22px, 4vw, 36px)",
                fontWeight: "700",
                background:
                  "linear-gradient(135deg, #d4a520 0%, #fbbf24 40%, #c084fc 80%, #d4a520 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "3px",
                textShadow: "none",
                marginBottom: "6px",
              }}
            >
              Challenges
            </h1>
            <p
              style={{
                fontFamily: "Rajdhani, sans-serif",
                fontSize: "12px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "rgba(212,165,32,0.45)",
              }}
            >
              Ramadan 1446 AH &nbsp;·&nbsp; Night of Code
            </p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-3 mt-3">
              <div
                style={{
                  height: "1px",
                  width: "80px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(212,165,32,0.4))",
                }}
              />
              <svg width="16" height="16" viewBox="0 0 16 16">
                <polygon
                  points="8,1 10,6 15,6 11,10 12.5,15 8,12 3.5,15 5,10 1,6 6,6"
                  fill="rgba(212,165,32,0.6)"
                />
              </svg>
              <div
                style={{
                  height: "1px",
                  width: "80px",
                  background:
                    "linear-gradient(90deg, rgba(212,165,32,0.4), transparent)",
                }}
              />
            </div>
          </motion.div>

          {/* Main layout: wheel + panel */}
          <div
            className="flex items-stretch justify-center gap-5"
            style={{ minHeight: "calc(100vh - 210px)" }}
          >
            {/* Wheel column */}
            <motion.div
              className="flex flex-col items-center justify-center gap-4 px-4 py-2"
              style={{
                flex: "0 0 auto",
                width: "min(620px, 100%)",
                minWidth: 0,
              }}
              animate={{ x: selectedCategory ? -38 : 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChallengeWheel
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryClick={handleCategoryClick}
                solvedCounts={solvedCounts}
              />
              <ScoreBar
                totalPoints={totalPoints}
                solvedCount={solvedCount}
                totalChallenges={totalChallenges}
              />
            </motion.div>

            {/* Challenge panel — slide in with x/opacity only (no width animation) */}
            <AnimatePresence initial={false}>
              {selectedCategory && selectedCat && (
                <motion.div
                  key="desktop-panel"
                  className="hidden md:block"
                  style={{
                    width: "380px",
                    flexShrink: 0,
                    height: "calc(100vh - 150px)",
                    marginTop: "10px",
                    zIndex: 20,
                  }}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ChallengePanel
                    category={selectedCat}
                    solvedIds={solvedIds}
                    onSolve={handleSolve}
                    onClose={() => setSelectedCategory(null)}
                    onChallengeUpdate={fetchChallenges}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile panel (bottom sheet style) */}
          <AnimatePresence initial={false}>
            {selectedCategory && selectedCat && (
              <motion.div
                key="mobile-panel"
                className="md:hidden fixed bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden"
                style={{
                  zIndex: 50,
                  maxHeight: "65vh",
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ChallengePanel
                  category={selectedCat}
                  solvedIds={solvedIds}
                  onSolve={handleSolve}
                  onClose={() => setSelectedCategory(null)}
                  onChallengeUpdate={fetchChallenges}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom decorative bar */}
          <div
            className="fixed bottom-0 left-0 right-0 pointer-events-none"
            style={{
              zIndex: 5,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, rgba(212,165,32,0.25), rgba(192,132,252,0.2), transparent)",
            }}
          />
        </div>
      )}
      <Footer />
    </div>
  );
}
