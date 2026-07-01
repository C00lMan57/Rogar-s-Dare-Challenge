import React, { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, ChevronRight, Wand2 } from "lucide-react";
import { Card } from "../types";

interface AISuggestionsProps {
  onAddDares: (newDaresText: string[]) => void;
  language: "fr" | "en";
}

export default function AISuggestions({ onAddDares, language }: AISuggestionsProps) {
  const [category, setCategory] = useState<'Soft' | 'Fun' | 'Hard' | 'Caliente'>('Fun');
  const [customTheme, setCustomTheme] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [generatedDares, setGeneratedDares] = useState<{ text: string; selected: boolean }[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setSuccessMessage("");
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category,
          count,
          customTheme,
          language
        })
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.dares)) {
        setGeneratedDares(
          data.dares.map((d: any) => ({
            text: d.text,
            selected: true
          }))
        );
      } else {
        console.error("Failed to generate dares");
      }
    } catch (err) {
      console.error("Error calling generate api:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (index: number) => {
    setGeneratedDares(prev =>
      prev.map((d, i) => (i === index ? { ...d, selected: !d.selected } : d))
    );
  };

  const handleAddSelected = () => {
    const selectedTexts = generatedDares.filter(d => d.selected).map(d => d.text);
    if (selectedTexts.length > 0) {
      onAddDares(selectedTexts);
      setSuccessMessage(
        language === "fr"
          ? `🎉 ${selectedTexts.length} défis ajoutés au jeu avec succès !`
          : `🎉 ${selectedTexts.length} dares successfully added to the game!`
      );
      setGeneratedDares([]);
      setCustomTheme("");
    }
  };

  const categories = [
    { value: "Soft", labelFr: "Soft 🍃", labelEn: "Soft 🍃", descFr: "Gentils gages, rires garantis", descEn: "Friendly dares, good vibes" },
    { value: "Fun", labelFr: "Fun 🤪", labelEn: "Fun 🤪", descFr: "Complètement insolites et absurdes", descEn: "Wild and completely absurd" },
    { value: "Hard", labelFr: "Hard 🔥", labelEn: "Hard 🔥", descFr: "Physiques, personnels ou osés", descEn: "Physical, revealing, or bold" },
    { value: "Caliente", labelFr: "Caliente 🌶️", labelEn: "Caliente 🌶️", descFr: "Séduction, regards et confidences", descEn: "Seduction, eye locks, and secrets" }
  ];

  return (
    <div className="bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-zinc-800/85 p-5 mt-4" id="ai-generator-panel">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-[#c5a059]/15 text-[#c5a059]">
          <Wand2 className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-white font-medium text-sm tracking-wide">
            {language === "fr" ? "Générateur Intelligent Gemini AI" : "Gemini AI Smart Dare Generator"}
          </h3>
          <p className="text-[11px] text-zinc-400">
            {language === "fr" ? "Crée instantanément des défis uniques sur n'importe quel thème !" : "Instantly craft unique challenges on any setting!"}
          </p>
        </div>
      </div>

      {/* Categories Toggle Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {categories.map(cat => {
          const isSelected = category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value as any)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#c5a059]/10 border-[#c5a059] text-white shadow-xs"
                  : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              <div className="font-semibold text-xs">{language === "fr" ? cat.labelFr : cat.labelEn}</div>
              <div className="text-[9px] text-zinc-500 mt-0.5 leading-tight">{language === "fr" ? cat.descFr : cat.descEn}</div>
            </button>
          );
        })}
      </div>

      {/* Input theme */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-1">
            {language === "fr" ? "Thème ou Contexte de la soirée (Optionnel)" : "Theme or Setting of the night (Optional)"}
          </label>
          <input
            type="text"
            value={customTheme}
            onChange={e => setCustomTheme(e.target.value)}
            placeholder={
              language === "fr"
                ? "Ex: Soirée piscine, Halloween, entre collègues, pyjama..."
                : "Ex: Pool party, Halloween, roommates night, cozy cabin..."
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-[#c5a059] transition-colors"
          />
        </div>

        {/* Count Selector */}
        <div className="flex justify-between items-center bg-zinc-950/30 p-2 rounded-xl border border-zinc-800/40">
          <span className="text-xs text-zinc-400 font-mono">
            {language === "fr" ? "Nombre de défis" : "Number of dares"}
          </span>
          <div className="flex gap-1.5">
            {[3, 5, 8].map(num => (
              <button
                key={num}
                onClick={() => setCount(num)}
                className={`w-7 h-7 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  count === num
                    ? "bg-[#c5a059] text-zinc-950 font-bold shadow-xs"
                    : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900 border border-zinc-800"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Launch Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-[#c5a059] hover:bg-[#d9b673] disabled:bg-zinc-900 disabled:text-zinc-500 text-zinc-950 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#c5a059]/10 active:scale-[0.98] cursor-pointer uppercase tracking-wider"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
            <span>{language === "fr" ? "Gemini concocte tes défis..." : "Gemini is blending dares..."}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-zinc-950" />
            <span>{language === "fr" ? "Générer avec Gemini AI ✨" : "Generate with Gemini AI ✨"}</span>
          </>
        )}
      </button>

      {/* Success alert */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-2.5 rounded-xl mt-3 text-center font-medium animate-bounce">
          {successMessage}
        </div>
      )}

      {/* Generated cards check */}
      {generatedDares.length > 0 && (
        <div className="mt-4 border-t border-zinc-800/80 pt-4 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-zinc-400 mb-2">
            <span>{language === "fr" ? "SÉLECTIONNE TES PRÉFÉRÉS" : "CHOOSE YOUR FAVORITES"}</span>
            <span>{generatedDares.filter(d => d.selected).length}/{generatedDares.length}</span>
          </div>

          <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {generatedDares.map((dare, idx) => (
              <div
                key={idx}
                onClick={() => handleToggleSelect(idx)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  dare.selected
                    ? "bg-[#c5a059]/10 border-[#c5a059]/50 text-zinc-100"
                    : "bg-zinc-950/30 border-zinc-900 text-zinc-500 hover:border-zinc-800"
                }`}
              >
                <div className="mt-0.5">
                  <CheckCircle2
                    className={`w-4 h-4 transition-all ${
                      dare.selected ? "text-[#c5a059] fill-[#c5a059]/10" : "text-zinc-700"
                    }`}
                  />
                </div>
                <span className="text-xs leading-tight font-medium select-none">{dare.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddSelected}
            className="w-full bg-[#c5a059] hover:bg-[#d9b673] text-zinc-950 text-xs font-bold py-2.5 rounded-xl mt-3 transition-colors active:scale-[0.98] cursor-pointer uppercase tracking-wider"
          >
            {language === "fr"
              ? `Ajouter les défis sélectionnés (${generatedDares.filter(d => d.selected).length})`
              : `Add selected dares (${generatedDares.filter(d => d.selected).length})`}
          </button>
        </div>
      )}
    </div>
  );
}
