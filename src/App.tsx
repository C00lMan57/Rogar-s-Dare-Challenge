import React, { useState } from "react";
import { Sparkles, Trophy, Users, Shield, Compass, HelpCircle, Globe, Play } from "lucide-react";
import LocalGame from "./components/LocalGame";
import PartyGame from "./components/PartyGame";

type ViewState = "MAIN_MENU" | "LOCAL_GAME" | "PARTY_GAME";

export default function App() {
  const [view, setView] = useState<ViewState>("MAIN_MENU");
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  const t = {
    title: "Rogar’s Dare Challenge",
    tagline: language === "fr" ? "Cap ou Pas Cap ? Relevez les défis d'une nouvelle génération." : "Dare or No Dare? Conquer the ultimate modern challenge.",
    desc: language === "fr"
      ? "Un jeu de cartes interactif addictif, propulsé par l'intelligence artificielle Gemini. Jouez en soirée locale ou créez des salons multijoueurs à distance avec votes en temps réel et défis secrets !"
      : "An addictive interactive card game powered by Gemini AI. Play locally together or launch remote multiplayer lobbies with real-time voting and secret user dares!",
    localTitle: language === "fr" ? "Pass & Play 📱" : "Pass & Play 📱",
    localDesc: language === "fr"
      ? "Le mode classique autour d'un seul téléphone. Saisissez vos noms et passez l'écran à tour de rôle. Idéal en soirée physique !"
      : "The classic mode around a single device. Enter your names and pass the phone around. Ideal for parties and get-togethers!",
    partyTitle: language === "fr" ? "Mode Party En Ligne 👥" : "Online Party Mode 👥",
    partyDesc: language === "fr"
      ? "Créez un salon privé et partagez le code. Rejoignez depuis votre propre écran pour voter en direct et ajouter des défis secrets et anonymes !"
      : "Create a private room and share the code. Join from your own device to vote live and add anonymous custom dares secretly!",
    howToTitle: language === "fr" ? "Comment Jouer ?" : "How to Play?",
    howTo1Title: language === "fr" ? "1. Choisis ton gage 🃏" : "1. Choose your dare 🃏",
    howTo1Text: language === "fr" ? "Clique directement sur la carte mystère pour dire 'CAP !' ou refuse le défi en cliquant sur 'Pas Cap'." : "Click the mystery card to say 'DARE!' and flip it, or choose 'No Dare' to pass and move on.",
    howTo2Title: language === "fr" ? "2. Réalise l'action 🎭" : "2. Perform the action 🎭",
    howTo2Text: language === "fr" ? "Une fois la carte retournée, pas le choix : accomplis le défi devant tout le monde pour gagner des points !" : "Once flipped, no turning back: complete the hilarious challenge in front of others to score points!",
    howTo3Title: language === "fr" ? "3. Votez à l'unanimité 🗳️" : "3. Vote & Succeed 🗳️",
    howTo3Text: language === "fr" ? "Les autres joueurs votent pour valider si le défi a été fait avec brio ou triché !" : "Other players vote in real-time to determine if you successfully completed the challenge or cheated!",
    footer: "Rogar’s Dare Challenge • Propulsé par Google Gemini AI"
  };

  return (
    <div className="min-h-screen atmosphere-bg text-zinc-100 flex flex-col justify-between overflow-x-hidden relative">
      {/* Decorative Grid and Background Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(197,160,89,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,160,89,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="w-full border-b border-zinc-900/80 bg-zinc-950/40 backdrop-blur-md px-4 py-3 sm:px-6 flex justify-between items-center z-10 relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setView("MAIN_MENU")}
          id="app-logo-branding"
        >
          <div className="p-1.5 rounded-lg bg-zinc-950 border border-[#c5a059]/40 shadow-md">
            <Sparkles className="w-4 h-4 text-[#c5a059]" />
          </div>
          <span className="font-mono text-xs font-black tracking-widest text-[#c5a059]">
            ROGAR'S
          </span>
        </div>

        {/* Language Selection bar */}
        <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setLanguage("fr")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              language === "fr"
                ? "bg-[#c5a059] text-zinc-950 shadow-xs"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              language === "en"
                ? "bg-[#c5a059] text-zinc-950 shadow-xs"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            EN
          </button>
        </div>
      </header>

      {/* MAIN SCREEN AREA */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-center items-center z-10 relative">
        {view === "MAIN_MENU" && (
          <div className="w-full space-y-12 max-w-4xl text-center">
            {/* Branding Hero presentation */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none bg-linear-to-b from-white via-zinc-200 to-[#c5a059] bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-sm sm:text-lg text-[#c5a059] font-medium tracking-wide">
                {t.tagline}
              </p>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
                {t.desc}
              </p>
            </div>

            {/* BENTO-STYLE GRID SELECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* PASS & PLAY DECK */}
              <div
                onClick={() => setView("LOCAL_GAME")}
                className="group relative glass-panel glass-panel-hover rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1 overflow-hidden"
                id="select-mode-local"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#c5a059]/10 transition-colors" />
                <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-white text-lg font-bold mb-2 group-hover:text-[#c5a059] transition-colors">
                  {t.localTitle}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {t.localDesc}
                </p>
                <div className="mt-5 flex items-center gap-1 text-[11px] font-bold text-[#c5a059]">
                  <span>{language === "fr" ? "Lancer le salon local" : "Launch local salon"}</span>
                  <Play className="w-3 h-3 fill-[#c5a059]" />
                </div>
              </div>

              {/* PARTY MODE DECK */}
              <div
                onClick={() => setView("PARTY_GAME")}
                className="group relative glass-panel glass-panel-hover rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1 overflow-hidden"
                id="select-mode-party"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#c5a059]/10 transition-colors" />
                <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-white text-lg font-bold mb-2 group-hover:text-[#c5a059] transition-colors">
                  {t.partyTitle}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {t.partyDesc}
                </p>
                <div className="mt-5 flex items-center gap-1 text-[11px] font-bold text-[#c5a059]">
                  <span>{language === "fr" ? "Créer ou rejoindre un salon" : "Create or join a room"}</span>
                  <Play className="w-3 h-3 fill-[#c5a059]" />
                </div>
              </div>
            </div>

            {/* HOW TO PLAY WALKTHROUGH */}
            <div className="border-t border-zinc-900/80 pt-10 max-w-3xl mx-auto space-y-6">
              <span className="text-xs uppercase font-mono tracking-widest text-[#c5a059]">
                {t.howToTitle}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                <div className="space-y-1.5 p-4 rounded-xl glass-panel">
                  <h4 className="text-[#c5a059] text-xs font-bold font-mono uppercase tracking-wider">
                    {t.howTo1Title}
                  </h4>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {t.howTo1Text}
                  </p>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl glass-panel">
                  <h4 className="text-[#c5a059] text-xs font-bold font-mono uppercase tracking-wider">
                    {t.howTo2Title}
                  </h4>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {t.howTo2Text}
                  </p>
                </div>
                <div className="space-y-1.5 p-4 rounded-xl glass-panel">
                  <h4 className="text-[#c5a059] text-xs font-bold font-mono uppercase tracking-wider">
                    {t.howTo3Title}
                  </h4>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {t.howTo3Text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DYNAMIC SCREEN VIEWS */}
        {view === "LOCAL_GAME" && (
          <LocalGame language={language} onBack={() => setView("MAIN_MENU")} />
        )}

        {view === "PARTY_GAME" && (
          <PartyGame language={language} onBack={() => setView("MAIN_MENU")} />
        )}
      </main>

      {/* FOOTER COLOURED BAR */}
      <footer className="w-full border-t border-zinc-900/80 bg-zinc-950/20 py-4 text-center z-10 relative">
        <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-600">
          {t.footer}
        </p>
      </footer>
    </div>
  );
}
