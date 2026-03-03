import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 py-6 text-center border-t border-white/5 bg-[#060b15]/80 backdrop-blur-sm mt-auto">
      <div className="flex flex-col items-center justify-center gap-2 text-xs font-[Rajdhani] tracking-widest text-white/40 uppercase">
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <span className="text-[#fbbf24] font-bold">Engineers Spark ISETCom</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Theme Designed by</span>
          <span className="text-[#c084fc] font-bold">Angel</span>
        </div>
      </div>
    </footer>
  );
}
