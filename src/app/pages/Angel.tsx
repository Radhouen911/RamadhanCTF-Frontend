import { MessageCircle, UserRound } from "lucide-react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { IslamicPattern } from "../components/IslamicPattern";
import { StarField } from "../components/StarField";

export function Angel() {
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
      <Header totalPoints={0} solvedCount={0} />

      <main className="relative z-10 pt-28 px-4 pb-20 max-w-4xl mx-auto flex-1 w-full">
        <div className="bg-[#0a0f20]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg">
          <h1 className="font-['Cinzel_Decorative'] text-4xl font-bold text-white mb-3">
            Created by Angel
          </h1>
          <p className="font-[Rajdhani] text-amber-500/70 uppercase tracking-widest text-sm mb-8">
            Contact & Support
          </p>

          <div className="space-y-5 text-white/80 font-[Rajdhani] text-lg leading-relaxed">
            <p>
              I created this platform. Please don't hesitate to report anything
              to me or ask me any question.
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <UserRound size={20} className="text-amber-400 mt-0.5" />
              <div>
                <p className="text-white/60 text-sm uppercase tracking-wider">
                  Discord ID
                </p>
                <p className="text-white text-xl font-semibold">angel.911</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
              <MessageCircle size={20} className="text-[#c084fc] mt-0.5" />
              <div>
                <p className="text-white/60 text-sm uppercase tracking-wider">
                  Discord Direct Message
                </p>
                <a
                  href="https://discord.com/channels/@me"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#c084fc] hover:text-amber-400 transition-colors text-lg font-semibold"
                >
                  Open Discord DM
                </a>
                <p className="text-white/50 text-sm mt-1">
                  If the DM link does not open directly, search for
                  <span className="text-white"> angel.911 </span>
                  in Discord and send me a message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
