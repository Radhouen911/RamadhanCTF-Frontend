import { User } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Footer } from "../components/Footer";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";

export function Register() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060b15] text-white flex flex-col">
      <StarField />
      <IslamicPattern />
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/30">
                <User className="w-6 h-6 text-amber-500" />
              </div>
            </Link>
            <h2 className="font-['Cinzel_Decorative'] text-3xl font-bold text-white mb-2">
              Archive Mode
            </h2>
            <p className="font-[Rajdhani] text-slate-400 text-sm tracking-wider">
              Registration is disabled. All data is static for historical
              reference.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
// ...existing code...
