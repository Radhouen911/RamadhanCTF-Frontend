import { motion } from "motion/react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";

interface SolveHistoryItem {
  id: number;
  name: string;
  category: string;
  points: number;
  date: string;
}

export function Profile() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <StarField />
      <IslamicPattern />
      <Header totalPoints={0} solvedCount={0} />

      <main className="relative z-10 pt-28 px-4 pb-20 max-w-4xl mx-auto flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-white font-[Cinzel] mb-2">
            Profile (Archive Mode)
          </h2>
          <p className="font-[Rajdhani] text-slate-400 text-sm tracking-wider">
            Profile pages are disabled. All data is static for historical
            reference.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
