import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
}

export function Confetti({ active, color = '#fbbf24' }: { active: boolean; color?: string }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200, // Spread X
        y: (Math.random() - 0.5) * 200, // Spread Y
        color: Math.random() > 0.5 ? color : '#ffffff',
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);
      
      // Clear after animation
      const timer = setTimeout(() => setParticles([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [active, color]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible" style={{ zIndex: 100 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.rotation + 180,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            backgroundColor: p.color,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
}
