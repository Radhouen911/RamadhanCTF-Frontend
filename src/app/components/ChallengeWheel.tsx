import { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Lock, Terminal, Search, Eye, Sparkles } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { FC } from 'react';
import { categories } from './data';

// SVG wheel math helpers
const CX = 300, CY = 300;
const OUTER_R = 258;
const INNER_R = 112;

const polarToCartesian = (r: number, angleDeg: number) => {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
};

const describeArc = (outerR: number, innerR: number, startAngle: number, endAngle: number) => {
  const o1 = polarToCartesian(outerR, startAngle);
  const o2 = polarToCartesian(outerR, endAngle);
  const i1 = polarToCartesian(innerR, startAngle);
  const i2 = polarToCartesian(innerR, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i1.x} ${i1.y}`,
    'Z',
  ].join(' ');
};

type IconFC = FC<LucideProps>;

const iconMap: Record<string, IconFC> = {
  Globe: Globe as IconFC,
  Lock: Lock as IconFC,
  Terminal: Terminal as IconFC,
  Search: Search as IconFC,
  Eye: Eye as IconFC,
  Sparkles: Sparkles as IconFC,
};

interface ChallengeWheelProps {
  selectedCategory: string | null;
  onCategoryClick: (id: string) => void;
  solvedCounts: Record<string, { solved: number; total: number }>;
}

export function ChallengeWheel({
  selectedCategory,
  onCategoryClick,
  solvedCounts,
}: ChallengeWheelProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const segAngle = 360 / categories.length;
  const ROTATION_OFFSET = -segAngle / 2;
  const GAP = 2.2;

  const selectedCat = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative"
        style={{ filter: 'drop-shadow(0 0 40px rgba(212,165,32,0.12))' }}
      >
        <motion.div
          className="relative"
          style={{ width: 'min(420px, 88vw, 60vh)', height: 'min(420px, 88vw, 60vh)' }}
          initial={{ rotate: 360, scale: 0.7, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg
            viewBox="0 0 600 600"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              {/* Glow filters per category */}
              {categories.map((cat) => (
                <filter key={`glow-${cat.id}`} id={`glow-${cat.id}`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}

              <filter id="center-glow-f" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="14" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="rim-glow-f" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation="3" />
              </filter>

              {/* Segment gradients */}
              {categories.map((cat, i) => {
                const mid = i * segAngle + segAngle / 2 + ROTATION_OFFSET;
                const inner = polarToCartesian(INNER_R, mid);
                const outer = polarToCartesian(OUTER_R, mid);
                return (
                  <linearGradient
                    key={`grad-${cat.id}`}
                    id={`grad-${cat.id}`}
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={cat.darkColor} stopOpacity="0.95" />
                    <stop offset="60%" stopColor={cat.midColor} stopOpacity="0.75" />
                    <stop offset="100%" stopColor={cat.color} stopOpacity="0.6" />
                  </linearGradient>
                );
              })}

              <radialGradient id="center-bg-g" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f1e3d" stopOpacity="1" />
                <stop offset="70%" stopColor="#080e1e" stopOpacity="1" />
                <stop offset="100%" stopColor="#050a14" stopOpacity="1" />
              </radialGradient>

              <linearGradient id="gold-rim-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4a520" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#b8860b" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Outer decorative rings */}
            <circle cx={CX} cy={CY} r={278} fill="none" stroke="rgba(212,165,32,0.35)" strokeWidth="3" filter="url(#rim-glow-f)" />
            <circle cx={CX} cy={CY} r={278} fill="none" stroke="url(#gold-rim-g)" strokeWidth="1" />

            {/* Outer tick marks */}
            {Array.from({ length: 24 }, (_, i) => {
              const isMajor = i % 4 === 0;
              const inner = polarToCartesian(282, i * 15);
              const outer = polarToCartesian(288, i * 15);
              return (
                <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                  stroke={isMajor ? 'rgba(212,165,32,0.7)' : 'rgba(212,165,32,0.3)'}
                  strokeWidth={isMajor ? 1.5 : 0.8} />
              );
            })}

            {/* Segment boundary dots */}
            {categories.map((_, i) => {
              const pt = polarToCartesian(278, i * segAngle + ROTATION_OFFSET);
              return <circle key={i} cx={pt.x} cy={pt.y} r={3} fill="rgba(212,165,32,0.7)" stroke="rgba(212,165,32,0.3)" strokeWidth="1" />;
            })}

            {/* Diamond accents */}
            {categories.map((cat, i) => {
              const pt = polarToCartesian(278, i * segAngle + segAngle / 2 + ROTATION_OFFSET);
              const isActive = selectedCategory === cat.id || hovered === cat.id;
              return (
                <polygon key={cat.id}
                  points={`${pt.x},${pt.y - 6} ${pt.x + 4},${pt.y} ${pt.x},${pt.y + 6} ${pt.x - 4},${pt.y}`}
                  fill={isActive ? cat.color : 'rgba(212,165,32,0.5)'}
                  style={{ transition: 'fill 0.3s ease' }} />
              );
            })}

            {/* Main segments */}
            {categories.map((cat, i) => {
              const startAngle = i * segAngle + GAP + ROTATION_OFFSET;
              const endAngle = (i + 1) * segAngle - GAP + ROTATION_OFFSET;
              const isSelected = selectedCategory === cat.id;
              const isHovered = hovered === cat.id;
              const isActive = isSelected || isHovered;
              const isDimmed = selectedCategory !== null && !isSelected && !isHovered;

              const oR = isActive ? OUTER_R + 10 : OUTER_R;
              const iR = isActive ? INNER_R - 6 : INNER_R;
              const path = describeArc(oR, iR, startAngle, endAngle);
              const glowPath = describeArc(OUTER_R + 20, INNER_R - 10, startAngle, endAngle);

              // Outer arc highlight points
              const arcStart = polarToCartesian(oR, startAngle);
              const arcEnd = polarToCartesian(oR, endAngle);
              const largeArc = endAngle - startAngle > 180 ? 1 : 0;
              const outerArcD = `M ${arcStart.x} ${arcStart.y} A ${oR} ${oR} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`;

              // Progress arc
              const counts = solvedCounts[cat.id];
              const progressRatio = counts ? counts.solved / counts.total : 0;
              const showProgress = progressRatio > 0;
              const progEnd = startAngle + (endAngle - startAngle) * progressRatio;
              const progStart = polarToCartesian(INNER_R + 2, startAngle + GAP);
              const progEndPt = polarToCartesian(INNER_R + 2, progEnd);
              const progLarge = progEnd - startAngle > 180 ? 1 : 0;
              const progressArcD = `M ${progStart.x} ${progStart.y} A ${INNER_R + 2} ${INNER_R + 2} 0 ${progLarge} 1 ${progEndPt.x} ${progEndPt.y}`;

              return (
                <g key={cat.id}>
                  {isActive && (
                    <path d={glowPath} fill={cat.color} opacity="0.18" filter={`url(#glow-${cat.id})`} />
                  )}
                  <path
                    d={path}
                    fill={`url(#grad-${cat.id})`}
                    stroke={isActive ? cat.color : 'rgba(255,255,255,0.07)'}
                    strokeWidth={isActive ? 1.5 : 0.5}
                    opacity={isDimmed ? 0.62 : 1}
                    style={{
                      cursor: 'pointer',
                      transition: 'opacity 0.3s ease',
                      filter: isSelected ? `drop-shadow(0 0 10px ${cat.color})` : 'none',
                    }}
                    onClick={() => onCategoryClick(cat.id)}
                    onMouseEnter={() => setHovered(cat.id)}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {isActive && (
                    <path d={outerArcD} fill="none" stroke={cat.color} strokeWidth="2.5" opacity="0.85" />
                  )}
                  {showProgress && (
                    <path d={progressArcD} fill="none" stroke={cat.color} strokeWidth="4" opacity="0.55" />
                  )}
                </g>
              );
            })}

            {/* Segment dividers */}
            {categories.map((_, i) => {
              const angle = i * segAngle + ROTATION_OFFSET;
              const ip = polarToCartesian(INNER_R - 8, angle);
              const op = polarToCartesian(OUTER_R + 2, angle);
              return <line key={i} x1={ip.x} y1={ip.y} x2={op.x} y2={op.y} stroke="rgba(212,165,32,0.4)" strokeWidth="1" />;
            })}

            {/* Inner ring */}
            <circle cx={CX} cy={CY} r={INNER_R} fill="none" stroke="rgba(212,165,32,0.35)" strokeWidth="1" />
            <circle cx={CX} cy={CY} r={INNER_R - 8} fill="none" stroke="rgba(212,165,32,0.15)" strokeWidth="0.5" strokeDasharray="3 5" />

            {/* Center background */}
            <circle cx={CX} cy={CY} r={INNER_R - 2} fill="url(#center-bg-g)" />

            {/* Center crescent (no selection) */}
            {!selectedCategory && (
              <g filter="url(#center-glow-f)">
                <circle cx={CX - 4} cy={CY - 6} r={45} fill="rgba(251,191,36,0.06)" />
                <circle cx={CX - 4} cy={CY - 6} r={36} fill="#fbbf24" opacity="0.92" />
                <circle cx={CX + 12} cy={CY - 13} r={29} fill="#080e1e" />
              </g>
            )}
            {!selectedCategory && (
              <g fill="#fbbf24">
                <polygon points={`${CX + 26},${CY - 32} ${CX + 28.5},${CY - 39} ${CX + 31},${CY - 32} ${CX + 28.5},${CY - 25}`} opacity="0.95" />
                <circle cx={CX + 35} cy={CY - 18} r="1.8" opacity="0.7" />
                <circle cx={CX + 24} cy={CY - 47} r="1.3" opacity="0.5" />
                <circle cx={CX + 38} cy={CY - 42} r="1" opacity="0.4" />
              </g>
            )}

            {/* Center category label (selection active) */}
            {selectedCategory && selectedCat && (
              <g>
                <text
                  x={CX} y={CY - 12}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={selectedCat.color} fontSize="20"
                  fontFamily="Rajdhani, sans-serif" fontWeight="700"
                  letterSpacing="3"
                  style={{ filter: `drop-shadow(0 0 8px ${selectedCat.color})` }}
                >
                  {selectedCat.name.toUpperCase()}
                </text>
                <text
                  x={CX} y={CY + 14}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="rgba(255,255,255,0.45)" fontSize="10"
                  fontFamily="Rajdhani, sans-serif" letterSpacing="1.5"
                >
                  {solvedCounts[selectedCategory]?.solved ?? 0}/{solvedCounts[selectedCategory]?.total ?? 0} SOLVED
                </text>
              </g>
            )}

            {/* Center ring glow */}
            <circle
              cx={CX} cy={CY} r={INNER_R - 2}
              fill="none"
              stroke={selectedCat ? selectedCat.color : 'rgba(212,165,32,0.45)'}
              strokeWidth="1.5"
              style={{ transition: 'stroke 0.4s ease' }}
              filter={selectedCat ? `url(#glow-${selectedCat.id})` : undefined}
            />
          </svg>

          {/* Icon + label overlays */}
          {categories.map((cat, i) => {
            const midAngle = i * segAngle + segAngle / 2 + ROTATION_OFFSET;
            const iconPt = polarToCartesian(183, midAngle);
            const labelPt = polarToCartesian(226, midAngle);

            const iconLeft = (iconPt.x / 600) * 100;
            const iconTop = (iconPt.y / 600) * 100;
            const labelLeft = (labelPt.x / 600) * 100;
            const labelTop = (labelPt.y / 600) * 100;

            const isSelected = selectedCategory === cat.id;
            const isHovered = hovered === cat.id;
            const isActive = isSelected || isHovered;
            const isDimmed = selectedCategory !== null && !isSelected && !isHovered;

            const IconComp = iconMap[cat.iconName];

            return (
              <div key={cat.id} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: `${iconLeft}%`, top: `${iconTop}%`, transform: 'translate(-50%, -50%)' }}>
                  <IconComp
                    size={isActive ? 22 : 20}
                    color={isActive ? cat.color : `rgba(255,255,255,${isDimmed ? 0.3 : 0.8})`}
                    style={{
                      transition: 'color 0.3s ease, filter 0.3s ease, transform 0.3s ease',
                      filter: isActive ? `drop-shadow(0 0 10px ${cat.color}) drop-shadow(0 0 16px ${cat.color}80)` : 'none',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    }}
                  />
                </div>
                <div style={{ position: 'absolute', left: `${labelLeft}%`, top: `${labelTop}%`, transform: 'translate(-50%, -50%)', width: '60px', textAlign: 'center' }}>
                  <span style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: isActive ? '11px' : '10px',
                    fontWeight: isActive ? '800' : '700',
                    letterSpacing: '1.8px',
                    textTransform: 'uppercase',
                    color: isActive ? cat.color : `rgba(255,255,255,${isDimmed ? 0.25 : 0.65})`,
                    transition: 'color 0.3s ease, font-size 0.3s ease, text-shadow 0.3s ease',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    textShadow: isActive ? `0 0 10px ${cat.color}, 0 0 18px ${cat.color}88` : 'none',
                  }}>
                    {cat.name}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '12px',
            letterSpacing: '2.5px',
            color: 'rgba(212,165,32,0.5)',
            textAlign: 'center',
            textTransform: 'uppercase',
            marginTop: '8px',
          }}
        >
          {selectedCategory ? 'Click again to deselect' : 'Select a category to begin'}
        </motion.p>
      </div>
    </div>
  );
}
