import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

const STAR_COLORS = [
  'rgba(255,255,255,',
  'rgba(251,191,36,',
  'rgba(167,139,250,',
  'rgba(147,197,253,',
];

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const stars: Star[] = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.6 + 0.2,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.03 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    }));

    interface ShootingStar {
      x: number; y: number; vx: number; vy: number; life: number; maxLife: number;
    }
    let shootingStars: ShootingStar[] = [];
    let lastShoot = 0;
    let animFrame: number;
    let time = 0;

    const animate = (ts: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      stars.forEach((star) => {
        const opacity = star.opacity * (0.4 + 0.6 * Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${opacity})`;
        ctx.fill();
      });

      if (ts - lastShoot > 4000 + Math.random() * 3000) {
        lastShoot = ts;
        shootingStars.push({
          x: Math.random() * canvas.width * 0.6,
          y: Math.random() * canvas.height * 0.4,
          vx: 4 + Math.random() * 4,
          vy: 2 + Math.random() * 2,
          life: 0,
          maxLife: 60,
        });
      }

      // Update and draw shooting stars — filter instead of splice to avoid mutation during iteration
      shootingStars = shootingStars.filter((s) => {
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        const progress = s.life / s.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.9;
        const tailX = s.x - s.vx * 12;
        const tailY = s.y - s.vy * 12;
        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, `rgba(255,255,255,${alpha})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        return s.life < s.maxLife;
      });

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
