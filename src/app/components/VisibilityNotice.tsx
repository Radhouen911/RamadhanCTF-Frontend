import { EyeOff } from "lucide-react";
import { motion } from "motion/react";

interface VisibilityNoticeProps {
  title: string;
  description: string;
}

export function VisibilityNotice({
  title,
  description,
}: VisibilityNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="max-w-3xl mx-auto"
    >
      <div className="rounded-2xl border border-amber-500/15 bg-[#0a0f20]/70 p-8 text-center backdrop-blur-xl shadow-lg">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <EyeOff size={24} />
        </div>
        <h2 className="mb-3 font-[Rajdhani] text-2xl font-bold uppercase tracking-wider text-white">
          {title}
        </h2>
        <p className="mx-auto max-w-2xl font-[Rajdhani] text-base leading-7 text-white/65">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
