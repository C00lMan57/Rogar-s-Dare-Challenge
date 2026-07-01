import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, HelpCircle, ShieldAlert } from "lucide-react";
import { Card } from "../types";

interface ThreeDCardProps {
  card: Card | null;
  isFlipped: boolean;
  onFlip: () => void;
  direction: "left" | "right" | "none";
}

export default function ThreeDCard({ card, isFlipped, onFlip, direction }: ThreeDCardProps) {
  // Determine gradient/border based on card category
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Soft":
        return {
          glow: "rgba(34, 197, 94, 0.4)", // soft green
          border: "border-green-500/50",
          bg: "from-zinc-900 via-zinc-950 to-green-950/40",
          badge: "bg-green-500/10 text-green-400 border-green-500/30",
          accent: "text-green-400"
        };
      case "Fun":
        return {
          glow: "rgba(168, 85, 247, 0.4)", // rich purple
          border: "border-purple-500/50",
          bg: "from-zinc-900 via-zinc-950 to-purple-950/40",
          badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          accent: "text-purple-400"
        };
      case "Hard":
        return {
          glow: "rgba(239, 68, 68, 0.4)", // fierce red
          border: "border-red-500/50",
          bg: "from-zinc-900 via-zinc-950 to-red-950/40",
          badge: "bg-red-500/10 text-red-400 border-red-500/30",
          accent: "text-red-400"
        };
      case "Caliente":
        return {
          glow: "rgba(236, 72, 153, 0.4)", // hot pink
          border: "border-pink-500/50",
          bg: "from-zinc-900 via-zinc-950 to-pink-950/40",
          badge: "bg-pink-500/10 text-pink-400 border-pink-500/30",
          accent: "text-pink-400"
        };
      case "Custom":
        return {
          glow: "rgba(6, 182, 212, 0.4)", // vibrant cyan
          border: "border-cyan-500/50",
          bg: "from-zinc-900 via-zinc-950 to-cyan-950/40",
          badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          accent: "text-cyan-400"
        };
      case "Supreme":
        return {
          glow: "rgba(220, 38, 38, 0.6)", // intense red
          border: "border-red-600 animate-pulse",
          bg: "from-zinc-950 via-zinc-900 to-red-950/70",
          badge: "bg-red-600/30 text-white border-red-500/50 animate-pulse",
          accent: "text-red-400"
        };
      case "Honte":
        return {
          glow: "rgba(245, 158, 11, 0.5)", // warning amber
          border: "border-amber-500 animate-pulse",
          bg: "from-zinc-950 via-zinc-900 to-amber-950/50",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse",
          accent: "text-amber-400"
        };
      default:
        return {
          glow: "rgba(139, 92, 246, 0.3)",
          border: "border-violet-500/50",
          bg: "from-zinc-900 via-zinc-950 to-zinc-900",
          badge: "bg-violet-500/10 text-violet-400 border-violet-500/30",
          accent: "text-violet-400"
        };
    }
  };

  const currentStyles = getCategoryStyles(card?.category || "Soft");

  // Motion variants for slide transition
  const cardVariants = {
    initial: {
      scale: 0.9,
      opacity: 0,
      y: 40,
      rotateX: 5
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: (dir: "left" | "right" | "none") => {
      const xOffset = dir === "left" ? -400 : dir === "right" ? 400 : 0;
      const yOffset = dir === "none" ? 150 : 0;
      return {
        x: xOffset,
        y: yOffset,
        opacity: 0,
        scale: 0.85,
        rotateZ: dir === "left" ? -10 : dir === "right" ? 10 : 0,
        transition: { duration: 0.3, ease: "easeInOut" }
      };
    }
  };

  return (
    <div className="relative w-full max-w-[340px] h-[460px] mx-auto perspective-1000 select-none">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={card ? card.id : "empty-card"}
          custom={direction}
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full cursor-pointer relative"
          onClick={!isFlipped ? onFlip : undefined}
          style={{ transformStyle: "preserve-3d" }}
          id="dare-card-container"
        >
          {/* Outer Card Wrapper with custom glowing shadow */}
          <div
            className={`w-full h-full rounded-3xl transition-transform duration-500 relative ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              boxShadow: isFlipped
                ? `0 20px 50px -5px rgba(197, 160, 89, 0.3)`
                : "0 20px 40px -15px rgba(197, 160, 89, 0.4)",
            }}
          >
            {/* CARD FRONT (Mystery Face-Down) */}
            <div
              className={`absolute inset-0 backface-hidden w-full h-full rounded-3xl p-6 flex flex-col justify-between overflow-hidden border-8 ${
                card?.category === "Supreme"
                  ? "bg-gradient-to-b from-red-950 via-red-900 to-zinc-950 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                  : "bg-[#1c0e2d] border-[#c5a059]"
              }`}
              style={{ backfaceVisibility: "hidden" }}
              id="card-face-front"
            >
              {/* Mystic Grid Background Accent */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(197,160,89,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,160,89,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#c5a059]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl" />

              {/* Card Header Design */}
              <div className={`flex justify-between items-center text-xs tracking-widest font-mono font-bold ${
                card?.category === "Supreme" ? "text-red-400" : "text-[#c5a059]/80"
              }`}>
                <span>ROGAR'S</span>
                <span className={`flex items-center gap-1 ${card?.category === "Supreme" ? "text-red-400" : "text-[#c5a059]"}`}>
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> MYSTERY
                </span>
                <span>DARE</span>
              </div>

              {/* Card Center Mystery Artwork */}
              <div className="flex flex-col items-center justify-center my-auto relative">
                {/* Glowing Rings */}
                <div className="absolute w-32 h-32 border border-dashed border-[#c5a059]/20 rounded-full animate-spin [animation-duration:15s]" />
                <div className="absolute w-24 h-24 border border-[#c5a059]/10 rounded-full animate-ping [animation-duration:4s]" />
                
                {/* Big "?" character from the design */}
                <div className={`text-9xl font-black select-none animate-pulse ${
                  card?.category === "Supreme" ? "text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]" : "text-[#c5a059] drop-shadow-[0_0_25px_rgba(197,160,89,0.6)]"
                }`}>
                  ?
                </div>

                <p className="text-zinc-300 text-xs mt-6 text-center font-medium max-w-[200px]">
                  Clique pour dire <span className={`${card?.category === "Supreme" ? "text-red-400" : "text-[#c5a059]"} font-bold`}>"CAP !"</span> 🫵 et retourner la carte
                </p>
              </div>

              {/* Card Footer Design */}
              <div className={`text-center text-[10px] tracking-widest font-mono font-bold uppercase ${
                card?.category === "Supreme" ? "text-red-400/80" : "text-[#c5a059]/70"
              }`}>
                Est-ce que tu oses relever le défi ?
              </div>
            </div>

            {/* CARD BACK (Revealed Face-Up Challenge) */}
            <div
              className={`absolute inset-0 backface-hidden w-full h-full rounded-3xl p-6 flex flex-col justify-between border-8 ${
                card?.category === "Supreme"
                  ? "bg-gradient-to-b from-red-950 via-red-900 to-zinc-950 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                  : "bg-[#1c0e2d] border-[#c5a059]"
              }`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              id="card-face-back"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border uppercase font-mono tracking-wider font-semibold ${currentStyles.badge}`}
                >
                  {card?.category === "Honte" ? "🔥 GAGE HONTEUX" : card?.category === "Supreme" ? "👑 GAGE SUPRÊME" : `${card?.category} Dare`}
                </span>
                {card?.creator && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Par : <span className="text-cyan-400 font-semibold">{card.creator}</span>
                  </span>
                )}
              </div>

              {/* Card Content - Dare Text */}
              <div className="my-auto flex flex-col justify-center py-4">
                {card?.category === "Honte" && (
                  <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-3 animate-pulse">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-mono text-xs font-bold tracking-widest">PAS DE REFUS POSSIBLE !</span>
                  </div>
                )}
                <p className="text-white text-lg font-medium leading-relaxed tracking-wide text-center">
                  {card?.text}
                </p>
              </div>

              {/* Card Footer */}
              <div className="border-t border-zinc-800/60 pt-4 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Pénalité de refus</span>
                  <span className="text-xs text-red-400 font-medium">
                    {card?.category === "Honte" ? "⚠️ EXCLUSION DU JEU !" : "💔 -1 Point & Pénalité"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Réussite</span>
                  <span className={`text-xs font-semibold ${currentStyles.accent}`}>
                    {card?.category === "Hard" ? "+3 Pts" : card?.category === "Caliente" ? "+2 Pts" : "+1 Pt"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
