import React, { useState, useEffect, useRef } from "react";
import { Plus, Copy, Check, Users, Sparkles, Trophy, LogOut, ArrowRight, ShieldAlert, Vote, ShieldCheck, XCircle } from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import AISuggestions from "./AISuggestions";
import { Card, Player, Room } from "../types";

interface PartyGameProps {
  language: "fr" | "en";
  onBack: () => void;
}

export default function PartyGame({ language, onBack }: PartyGameProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [gameMode, setGameMode] = useState<'PARTY' | 'SUDDEN_DEATH'>('PARTY');
  const [anonymous, setAnonymous] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addingCustomCount, setAddingCustomCount] = useState(0);

  // Poll Interval Reference
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Translations
  const t = {
    title: language === "fr" ? "Mode Party Multijoueur 👥" : "Multiplayer Party Mode 👥",
    subtitle: language === "fr" ? "Créez ou rejoignez un salon pour jouer à distance ou à plusieurs !" : "Create or join a room to play together across screens!",
    createTitle: language === "fr" ? "Créer un Salon" : "Create a Room",
    joinTitle: language === "fr" ? "Rejoindre un Salon" : "Join a Room",
    namePlaceholder: language === "fr" ? "Ton pseudo..." : "Your username...",
    codePlaceholder: language === "fr" ? "Code salon (Ex: ABCD)..." : "Room code (Ex: ABCD)...",
    createBtn: language === "fr" ? "Créer Salon 👑" : "Create Room 👑",
    joinBtn: language === "fr" ? "Rejoindre 🎮" : "Join Game 🎮",
    lobbyTitle: language === "fr" ? "Salon de jeu" : "Game Lobby",
    gameModeLabel: language === "fr" ? "Mode de jeu" : "Game Mode",
    gameModeParty: language === "fr" ? "Party Mode" : "Party Mode",
    gameModeSuddenDeath: language === "fr" ? "Mort Subite" : "Sudden Death",
    addSecretTitle: language === "fr" ? "Ajouter un défi suprême secret au deck" : "Add secret supreme dare to the deck",
    addSecretPlaceholder: language === "fr" ? "Cap de faire un truc vraiment gênant..." : "Dare to do something truly embarrassing...",
    addSecretBtn: language === "fr" ? "Glisser le défi suprême dans le deck" : "Slide supreme dare into the deck",
    secretCustomLabel: language === "fr" ? "Ajout secret et anonyme (Suprême)" : "Secret and anonymous add (Supreme)",
    startBtn: language === "fr" ? "Lancer la partie ! 🚀" : "Launch Game! 🚀",
    waitingForHost: language === "fr" ? "En attente que l'hôte lance la partie..." : "Waiting for host to launch the game...",
    copyCode: language === "fr" ? "Copier le code" : "Copy Code",
    copied: language === "fr" ? "Copié !" : "Copied!",
    activePlayerTurn: language === "fr" ? "C'est le tour de" : "It is the turn of",
    score: language === "fr" ? "Score" : "Score",
    refusals: language === "fr" ? "Refus" : "Refusals",
    performingDare: language === "fr" ? "Réalise ton défi en direct !" : "Perform your dare live!",
    waitingVotes: language === "fr" ? "En attente des votes..." : "Waiting for player votes...",
    voteTitle: language === "fr" ? "Vote pour le défi de" : "Vote on the dare of",
    validateBtn: language === "fr" ? "Validé ! 👍 (Il a géré)" : "Validated! 👍 (Succeeded)",
    cheatBtn: language === "fr" ? "Triché/Raté 👎" : "Failed/Cheated 👎",
    verdictTitle: language === "fr" ? "Verdict du Vote" : "Vote Verdict",
    verdictSuccess: language === "fr" ? "Défi Validé ! 🎉" : "Dare Validated! 🎉",
    verdictFail: language === "fr" ? "Défi Raté/Triché ! ❌" : "Dare Failed/Cheated! ❌",
    nextTurnBtn: language === "fr" ? "Tour Suivant ➡️" : "Next Turn ➡️",
    waitingNextTurn: language === "fr" ? "En attente de l'hôte pour le tour suivant..." : "Waiting for host to advance to next turn...",
    customDeckCheck: language === "fr" ? "Mélanger les decks officiels" : "Mix official decks",
    leaveBtn: language === "fr" ? "Quitter le salon" : "Leave room"
  };

  // Start polling function
  const startPolling = (code: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/state/${code}`);
        const data = await res.json();
        if (data.success && data.room) {
          setRoom(data.room);
        } else {
          setError(language === "fr" ? "Connexion au salon perdue." : "Lost connection to the room.");
          stopPolling();
        }
      } catch (err) {
        console.error("Error polling room state:", err);
      }
    }, 1500);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  // Host creates room
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError(language === "fr" ? "Veuillez saisir votre pseudo." : "Please enter your username.");
      return;
    }
    setError("");
    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName: playerName.trim(),
          gameMode
        })
      });
      const data = await response.json();
      if (data.success) {
        setPlayerId(data.playerId);
        setRoom(data.room);
        setIsJoined(true);
        startPolling(data.roomCode);
      } else {
        setError(data.error || "Failed to create room");
      }
    } catch (err) {
      setError("Server connection error.");
    }
  };

  // Player joins existing room
  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCodeInput.trim()) {
      setError(language === "fr" ? "Saisissez votre pseudo et le code du salon." : "Please enter your username and room code.");
      return;
    }
    setError("");
    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: roomCodeInput.trim(),
          playerName: playerName.trim()
        })
      });
      const data = await response.json();
      if (data.success) {
        setPlayerId(data.playerId);
        setRoom(data.room);
        setIsJoined(true);
        startPolling(data.roomCode);
      } else {
        setError(data.error || "Room not found or game already started.");
      }
    } catch (err) {
      setError("Server connection error.");
    }
  };

  // Add custom challenge secretly
  const handleAddSecretCard = async () => {
    if (!customInput.trim() || !room) return;
    try {
      const response = await fetch("/api/rooms/add-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: room.code,
          playerId,
          cardText: customInput.trim(),
          anonymous
        })
      });
      const data = await response.json();
      if (data.success) {
        setCustomInput("");
        setAddingCustomCount(prev => prev + 1);
        setTimeout(() => setAddingCustomCount(0), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI dares secret import
  const handleAddAIDares = async (dares: string[]) => {
    if (!room) return;
    for (const text of dares) {
      await fetch("/api/rooms/add-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: room.code,
          playerId,
          cardText: text,
          anonymous: true
        })
      });
    }
    setAddingCustomCount(prev => prev + dares.length);
    setTimeout(() => setAddingCustomCount(0), 4000);
  };

  // Host starts game
  const handleStartGame = async () => {
    if (!room) return;
    try {
      const response = await fetch("/api/rooms/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: room.code,
          playerId,
          language,
          decks: hostSelectedDecks,
          maxRefusals: hostMaxRefusals,
          targetScore: hostTargetScore
        })
      });
      const data = await response.json();
      if (data.success) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle deck mixing checkboxes
  const handleToggleRoomDeck = async (deckName: string) => {
    if (!room) return;
    const isSelected = room.decks.includes(deckName);
    const updatedDecks = isSelected
      ? room.decks.filter(d => d !== deckName)
      : [...room.decks, deckName];

    // Optimistically update
    setRoom({ ...room, decks: updatedDecks });

    // Actually, we can make an endpoint or just pass the configuration upon start.
    // In our backend, room.decks can be modified directly or on the server.
    // For simplicity, since the start game API reads room.decks, we can modify it
    // on start, or just allow the host to select them right inside the local UI.
    // We can save selected decks on local component state for the host, and submit on start.
  };

  const [hostSelectedDecks, setHostSelectedDecks] = useState<string[]>(["Soft", "Fun"]);
  const [hostMaxRefusals, setHostMaxRefusals] = useState(3);
  const [hostTargetScore, setHostTargetScore] = useState(15);
  const handleToggleHostDeck = (deck: string) => {
    setHostSelectedDecks(prev =>
      prev.includes(deck) ? prev.filter(d => d !== deck) : [...prev, deck]
    );
  };

  // Game actions (Flip, Pass, Vote, Resolve)
  const handleAction = async (actionType: string, extra = {}) => {
    if (!room) return;
    try {
      const response = await fetch("/api/rooms/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: room.code,
          playerId,
          actionType,
          language,
          ...extra
        })
      });
      const data = await response.json();
      if (data.success) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Leave room
  const handleLeaveRoom = async () => {
    if (room) {
      try {
        await fetch("/api/rooms/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomCode: room.code,
            playerId
          })
        });
      } catch (e) {
        console.error(e);
      }
    }
    stopPolling();
    setIsJoined(false);
    setRoom(null);
    onBack();
  };

  // Copy code helper
  const handleCopyCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isJoined || !room) {
    /* JOIN / CREATE ROOM SCREEN */
    return (
      <div className="w-full max-w-md mx-auto space-y-6" id="party-entrance-container">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-white bg-linear-to-b from-white via-zinc-200 to-[#c5a059] bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            {t.subtitle}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2.5 rounded-xl text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Username Setup */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <label className="block text-[10px] uppercase font-mono tracking-widest text-[#c5a059] font-bold">
            {language === "fr" ? "Configure ton identité" : "Configure your identity"}
          </label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-[#c5a059] transition-colors"
          />
          
          {/* Game Mode Selection */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-[#c5a059] font-bold">
              {t.gameModeLabel} ({language === "fr" ? "Pour créer un salon" : "Lobby Creation Only"})
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setGameMode('PARTY')}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all ${gameMode === 'PARTY' ? 'bg-[#c5a059] text-zinc-950' : 'bg-zinc-900 text-zinc-400'}`}
              >
                {t.gameModeParty}
              </button>
              <button
                onClick={() => setGameMode('SUDDEN_DEATH')}
                className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all ${gameMode === 'SUDDEN_DEATH' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400'}`}
              >
                {t.gameModeSuddenDeath}
              </button>
            </div>
          </div>
        </div>

        {/* Create / Join Forms Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* JOIN SALON CARD */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#c5a059]" /> {t.joinTitle}
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder={t.codePlaceholder}
                maxLength={4}
                className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs uppercase font-mono tracking-wider text-center text-white placeholder-zinc-600 focus:outline-hidden focus:border-[#c5a059]"
              />
              <button
                onClick={handleJoinRoom}
                className="bg-[#c5a059] hover:bg-[#d9b673] text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                {t.joinBtn}
              </button>
            </div>
          </div>

          {/* CREATE SALON CARD */}
          <div className="glass-panel p-5 rounded-2xl text-center">
            <button
              onClick={handleCreateRoom}
              className="w-full bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#c5a059] font-bold py-3 px-4 rounded-xl transition-all text-xs tracking-wider uppercase active:scale-95 cursor-pointer"
            >
              {t.createBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active player in room state
  const isHost = room.hostId === playerId;
  const selfPlayer = room.players.find(p => p.id === playerId);
  const turnPlayer = room.players.find(p => p.id === room.turnPlayerId);
  const isMyTurn = room.turnPlayerId === playerId;

  if (room.status === "LOBBY") {
    /* LOBBY ROOM LOBBY SCREEN */
    return (
      <div className="w-full max-w-4xl mx-auto py-4 px-2 space-y-6" id="party-lobby-container">
        {/* Lobby room code presentation */}
        <div className="glass-panel rounded-2xl p-6 text-center space-y-3 relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl" />

          <div className="text-[10px] tracking-widest font-mono text-[#c5a059] font-bold uppercase flex justify-center items-center flex-wrap gap-2">
            <span>{language === "fr" ? "SALON PRIVÉ DISPONIBLE" : "PRIVATE GAME ROOM"}</span>
            <span className={`px-2 py-0.5 rounded-full border text-[9px] ${
              room.gameMode === "SUDDEN_DEATH"
                ? "bg-red-600/25 text-red-400 border-red-500/30 font-extrabold animate-pulse"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}>
              {room.gameMode === "SUDDEN_DEATH" ? (language === "fr" ? "💀 MORT SUBITE" : "💀 SUDDEN DEATH") : (language === "fr" ? "🎉 MODE PARTY" : "🎉 PARTY MODE")}
            </span>
          </div>

          <div className="flex justify-center items-center gap-3">
            <h2 className="text-4xl font-black tracking-widest text-white font-mono select-all bg-zinc-950/60 border border-zinc-800/80 px-5 py-2.5 rounded-2xl shadow-inner">
              {room.code}
            </h2>
            <button
              onClick={handleCopyCode}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-2.5 rounded-xl transition-all cursor-pointer"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-[#c5a059]" />}
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            {language === "fr"
              ? "Partage ce code avec tes amis pour qu'ils te rejoignent !"
              : "Share this code with your friends to let them join!"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CONNECTED PLAYERS LIST */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#c5a059]" /> {t.lobbyTitle}
              </span>
              <span className="text-xs bg-zinc-950/60 border border-zinc-800/40 text-zinc-400 font-mono px-2 py-0.5 rounded-full">
                {room.players.length} connecté(s)
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {room.players.map(p => (
                <div
                  key={p.id}
                  className="flex justify-between items-center bg-zinc-950/40 border border-zinc-900/60 p-3 rounded-xl"
                >
                  <span className="text-xs text-zinc-200 flex items-center gap-2 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center text-[9px] font-extrabold uppercase border border-[#c5a059]/30">
                      {p.name.charAt(0)}
                    </span>
                    {p.name} {p.id === playerId && <span className="text-zinc-500 font-mono text-[9px]">(Moi)</span>}
                  </span>
                  {p.isHost && (
                    <span className="text-[9px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      Host 👑
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ADD SECRET CARD ANONYMOUSLY */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="border-b border-zinc-800/60 pb-3">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                🤫 {t.addSecretTitle}
              </h3>
              <p className="text-[11px] text-zinc-500">
                {language === "fr"
                  ? "Personne ne saura qui a écrit quoi !"
                  : "Keep it hidden, surprise everyone during the game!"}
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder={t.addSecretPlaceholder}
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-[#c5a059] resize-none"
              />

              <div className="flex justify-between items-center bg-zinc-900/20 p-2 rounded-xl">
                <span className="text-[10px] font-mono tracking-widest text-[#c5a059] font-bold">
                  {t.secretCustomLabel}
                </span>
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={e => setAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[#c5a059]"
                />
              </div>

              <button
                onClick={handleAddSecretCard}
                className="w-full bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#c5a059] font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
              >
                {t.addSecretBtn}
              </button>

              {addingCustomCount > 0 && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs py-2 px-3 rounded-lg text-center font-medium">
                  {language === "fr"
                    ? `📬 +${addingCustomCount} défi secret glissé au chaud dans le deck !`
                    : `📬 +${addingCustomCount} secret dare slipped into the deck!`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI suggestions in lobby */}
        <div className="glass-panel rounded-2xl p-5 bg-zinc-950/10">
          <h3 className="text-sm font-semibold text-white mb-2">
            ✨ {language === "fr" ? "Glisser des défis AI Gemini en secret" : "Squeeze Gemini AI dares secretly"}
          </h3>
          <AISuggestions onAddDares={handleAddAIDares} language={language} />
        </div>

        {/* HOST GAME SETUP & PLAY BUTTON */}
        {isHost ? (
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <span className="text-sm font-semibold text-white block border-b border-zinc-800/60 pb-2">
              ⚙️ {language === "fr" ? "Configuration de l'hôte" : "Host Setup"}
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["Soft", "Fun", "Hard", "Caliente"].map(deck => {
                const isSel = hostSelectedDecks.includes(deck);
                return (
                  <button
                    key={deck}
                    onClick={() => handleToggleHostDeck(deck)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSel
                        ? "bg-[#c5a059]/10 border-[#c5a059] text-[#c5a059]"
                        : "bg-zinc-950/40 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {deck}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Max Refusals Slider */}
              <div className="bg-zinc-950/40 border border-zinc-900/60 p-3 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-[#c5a059]">
                  <span>{language === "fr" ? "Refus max" : "Max refusals"}</span>
                  <span className="text-[#c5a059] font-bold">{hostMaxRefusals} refus</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="5"
                  value={hostMaxRefusals}
                  onChange={e => setHostMaxRefusals(parseInt(e.target.value))}
                  className="w-full accent-[#c5a059] bg-zinc-900 cursor-pointer"
                />
              </div>

              {/* Target Score Slider */}
              <div className="bg-zinc-950/40 border border-zinc-900/60 p-3 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-[#c5a059]">
                  <span>{language === "fr" ? "Score cible" : "Target score"}</span>
                  <span className="text-[#c5a059] font-bold">{hostTargetScore} pts</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={hostTargetScore}
                  onChange={e => setHostTargetScore(parseInt(e.target.value))}
                  className="w-full accent-[#c5a059] bg-zinc-900 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full bg-[#c5a059] hover:bg-[#d9b673] text-zinc-950 font-black py-3.5 rounded-xl shadow-lg active:scale-95 cursor-pointer text-xs uppercase tracking-widest"
            >
              {t.startBtn}
            </button>
          </div>
        ) : (
          <div className="bg-zinc-950/40 border border-dashed border-zinc-800/80 p-4 rounded-xl text-center text-zinc-400 text-xs">
            ⏳ {t.waitingForHost}
          </div>
        )}

        <div className="flex justify-center">
          <button onClick={handleLeaveRoom} className="text-xs text-red-400 hover:underline flex items-center gap-1 cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> {t.leaveBtn}
          </button>
        </div>
      </div>
    );
  }

  /* GAMEPLAY MODE ACTIVE IN GAMEPLAY */
  if (room.status === "FINISHED") {
    const sortedPlayers = [...room.players].sort((a,b) => b.score - a.score);
    const winnerPlayer = sortedPlayers[0];

    return (
      <div className="w-full max-w-4xl mx-auto py-4 px-2 space-y-6 text-center animate-fade-in" id="victory-screen-multiplayer">
        <div className="relative inline-block">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-75 blur-lg animate-pulse" />
          <div className="relative bg-zinc-950 border-2 border-[#c5a059] p-8 rounded-full inline-flex items-center justify-center">
            <Trophy className="w-16 h-16 text-[#c5a059]" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#c5a059]">
            {language === "fr" ? "🏆 VICTOIRE FINALE !" : "🏆 FINAL VICTORY!"}
          </h2>
          <p className="text-white text-xl font-bold">
            🎉 {winnerPlayer?.name} 🎉
          </p>
          <p className="text-zinc-400 text-sm">
            {language === "fr" 
              ? `A atteint le score cible et remporte la partie !` 
              : `Reached target score and won the game!`} ({winnerPlayer?.score} / {room.targetScore || 15} pts)
          </p>
        </div>

        {/* Final Standings Grid */}
        <div className="glass-panel rounded-2xl p-5 max-w-md mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase font-mono tracking-widest text-[#c5a059] block border-b border-zinc-900 pb-2">
            🏆 Standings Finaux
          </span>
          <div className="space-y-2.5">
            {sortedPlayers.map((p, idx) => (
              <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-zinc-950/40 border border-zinc-900/40">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className="font-mono text-[#c5a059] font-bold">#{idx+1}</span>
                  <span className={p.id === winnerPlayer?.id ? "text-[#c5a059] font-black" : ""}>{p.name}</span>
                </span>
                <span className="font-extrabold text-white">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={() => handleAction("RESTART")}
            className="px-8 py-3 bg-[#c5a059] hover:bg-[#d9b673] text-zinc-950 font-bold rounded-xl tracking-wider shadow-lg shadow-[#c5a059]/20 transition-all active:scale-95 text-sm cursor-pointer"
          >
            {language === "fr" ? "Recommencer la partie (Lobby) 🔄" : "Restart Game (Lobby) 🔄"}
          </button>
        ) : (
          <div className="text-zinc-500 font-mono text-xs animate-pulse">
            ⏳ {language === "fr" ? "En attente que l'hôte relance la partie..." : "Waiting for host to restart..."}
          </div>
        )}

        <div className="flex justify-center pt-4">
          <button
            onClick={handleLeaveRoom}
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors border border-zinc-800/40 px-3 py-1.5 rounded-lg hover:border-zinc-700 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> {t.leaveBtn}
          </button>
        </div>
      </div>
    );
  }

  /* GAMEPLAY MODE ACTIVE IN GAMEPLAY */
  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 space-y-6" id="party-gameplay-container">
      {/* Turn indicator banner */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c5a059] text-zinc-950 flex items-center justify-center font-black shadow-sm text-lg">
            {turnPlayer?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#c5a059] font-bold">
              {t.activePlayerTurn}
            </span>
            <h3 className="text-white font-bold leading-tight flex items-center gap-1.5 text-base">
              {turnPlayer?.name} {isMyTurn && <span className="text-[10px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 px-1.5 py-0.5 rounded-md font-mono font-bold">Ton tour !</span>}
            </h3>
          </div>
        </div>

        {/* Scores & refusals info */}
        <div className="flex gap-2 text-xs items-center flex-wrap">
          <span className={`px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${
            room.gameMode === "SUDDEN_DEATH"
              ? "bg-red-600/25 text-red-400 border-red-500/30 animate-pulse"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}>
            {room.gameMode === "SUDDEN_DEATH" ? (language === "fr" ? "💀 MORT SUBITE" : "💀 SUDDEN DEATH") : (language === "fr" ? "🎉 MODE PARTY" : "🎉 PARTY MODE")}
          </span>
          <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-[#c5a059] font-bold">{t.score}</span>
            <span className="text-white font-extrabold">{turnPlayer?.score || 0}</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-[#c5a059] font-bold">{t.refusals}</span>
            <span className="text-white font-extrabold">{turnPlayer?.refusals || 0}/{room.maxRefusals}</span>
          </div>
        </div>
      </div>

      {/* 3D Card Stage */}
      <div className="py-2">
        <ThreeDCard
          card={room.currentCard}
          isFlipped={room.status !== "PLAYING"}
          onFlip={() => isMyTurn && handleAction("FLIP")}
          direction="none"
        />
      </div>

      {/* Gameplay State Controls */}
      <div className="max-w-[340px] mx-auto space-y-3">
        {room.status === "PLAYING" && (
          <div>
            {isMyTurn ? (
              <>
                {room.currentCard?.category !== 'Supreme' && (
                  <>
                    <button
                      onClick={() => handleAction("PASS")}
                      disabled={room.currentCard?.category === "Honte"}
                      className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-850 disabled:text-zinc-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-xs cursor-pointer flex justify-center items-center gap-1.5"
                    >
                      Pas Cap... 🙈
                    </button>
                    <button
                      onClick={() => handleAction("IMPOSSIBLE")}
                      disabled={room.currentCard?.category === "Honte"}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-850 disabled:text-zinc-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-xs cursor-pointer flex justify-center items-center gap-1.5"
                    >
                      Pas possible... 🛠️
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="bg-zinc-950/40 border border-dashed border-zinc-800/80 p-4 rounded-xl text-center text-zinc-400 text-xs">
                ⏳ {turnPlayer?.name} est en train de décider...
              </div>
            )}
          </div>
        )}

        {/* REVEALED / VOTING PHASE */}
        {(room.status === "CARD_REVEALED" || room.status === "VOTING") && (
          <div className="space-y-2">
            {room.currentCard?.category === "Supreme" ? (
              <div className="space-y-3 animate-fade-in">
                <div className="text-center p-3 rounded-xl bg-red-950/40 border border-red-500/20">
                  <span className="text-[10px] font-mono tracking-widest text-red-400 font-bold uppercase animate-pulse">
                    ⚠️ DÉFI SUPRÊME IMPOSÉ ⚠️
                  </span>
                  <p className="text-xs text-zinc-300 mt-1">
                    {turnPlayer?.name} {language === "fr" ? "doit faire le gage suprême ou être éliminé de la partie !" : "must complete the supreme dare or be eliminated!"}
                  </p>
                </div>

                {isMyTurn ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAction("RESOLVE_SUPREME", { outcome: "SUCCESS" })}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" /> {language === "fr" ? "Réussi 🎉" : "Succeeded 🎉"}
                    </button>
                    <button
                      onClick={() => handleAction("RESOLVE_SUPREME", { outcome: "FAIL" })}
                      className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> {language === "fr" ? "Perdu Élimination 💀" : "Lost Elimination 💀"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-zinc-950/40 border border-dashed border-red-500/20 p-4 rounded-xl text-center text-zinc-400 text-xs">
                    ⏳ {language === "fr" ? `En attente de la résolution du Défi Suprême de ${turnPlayer?.name}...` : `Waiting for ${turnPlayer?.name} to resolve the Supreme Dare...`}
                  </div>
                )}
              </div>
            ) : (
              <>
                {isMyTurn ? (
                  <div className="glass-panel border-[#c5a059]/30 p-4 rounded-xl text-center space-y-1">
                    <span className="text-white text-xs font-bold block">✨ {t.performingDare}</span>
                    <span className="text-[#c5a059] text-[11px] font-mono leading-tight">
                      {t.waitingVotes} ({room.players.filter(p => p.id !== playerId && p.currentVote !== null).length} / {room.players.length - 1})
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <span className="text-[10px] font-mono tracking-widest text-[#c5a059] uppercase text-center block font-bold">
                      {t.voteTitle} {turnPlayer?.name}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction("VOTE", { voteValue: "VALIDATED" })}
                        className={`flex-1 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          selfPlayer?.currentVote === "VALIDATED"
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-950 border border-zinc-800 text-emerald-400 hover:border-emerald-500/50"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" /> CAP !
                      </button>
                      <button
                        onClick={() => handleAction("VOTE", { voteValue: "CHEATED" })}
                        className={`flex-1 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          selfPlayer?.currentVote === "CHEATED"
                            ? "bg-red-600 text-white"
                            : "bg-zinc-950 border border-zinc-800 text-red-400 hover:border-red-500/50"
                        }`}
                      >
                        <XCircle className="w-4 h-4" /> TRICHÉ
                      </button>
                    </div>

                    <div className="text-[10px] text-center text-zinc-500 font-mono">
                      {room.players.filter(p => p.id !== room.turnPlayerId && p.currentVote !== null).length} / {room.players.length - 1} votes reçus
                    </div>
                  </div>
                )}

                {/* Host Force Resolve */}
                {isHost && (
                  <button
                    onClick={() => handleAction("FORCE_RESOLVE")}
                    className="w-full text-[10px] text-zinc-500 hover:text-zinc-300 underline block text-center cursor-pointer"
                  >
                    [Force Résoudre les votes]
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ROUND END REVEAL VERDICT */}
        {room.status === "ROUND_END" && (
          <div className="space-y-3 animate-fade-in">
            <div className={`text-center p-4 rounded-xl border ${
              room.currentCard?.category === "Supreme"
                ? "bg-red-950/20 border-red-500/30 text-red-400"
                : "glass-panel"
            }`}>
              <span className="text-[10px] font-mono tracking-widest text-[#c5a059] font-bold uppercase">
                {t.verdictTitle}
              </span>
              <h4 className="text-lg font-black text-white mt-1">
                {room.currentCard?.category === "Supreme" ? (
                  turnPlayer?.isEliminated ? (language === "fr" ? "ÉLIMINATION ! 💀" : "ELIMINATED! 💀") : (language === "fr" ? "RÉUSSI ! 🎉" : "SUCCESS! 🎉")
                ) : (
                  room.players.filter(p => p.id !== room.turnPlayerId && p.currentVote === "VALIDATED").length >=
                  room.players.filter(p => p.id !== room.turnPlayerId && p.currentVote === "CHEATED").length
                    ? t.verdictSuccess
                    : t.verdictFail
                )}
              </h4>
            </div>

            {isHost ? (
              <button
                onClick={() => handleAction("NEXT_ROUND")}
                className="w-full bg-[#c5a059] hover:bg-[#d9b673] text-zinc-950 font-black py-3.5 rounded-xl active:scale-95 cursor-pointer text-xs uppercase tracking-widest flex items-center justify-center gap-1"
              >
                {t.nextTurnBtn} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="bg-zinc-950/40 border border-dashed border-zinc-800/80 p-3 rounded-xl text-center text-zinc-500 text-xs">
                ⏳ {t.waitingNextTurn}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER MULTIPLAYER DATA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-900 pt-5">
        {/* Score board */}
        <div className="md:col-span-1 glass-panel rounded-2xl p-4 space-y-3">
          <span className="text-xs font-semibold uppercase font-mono tracking-widest text-[#c5a059] block border-b border-zinc-900 pb-2 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#c5a059]" /> Leaderboard
          </span>
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
            {[...room.players].sort((a,b) => b.score - a.score).map((p, idx) => (
              <div key={p.id} className={`flex justify-between items-center text-xs ${p.isEliminated ? 'opacity-50' : ''}`}>
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <span className="font-mono text-zinc-600 text-[10px]">#{idx+1}</span>
                  <span className={`${p.isEliminated ? 'line-through text-red-500' : p.id === playerId ? 'text-[#c5a059] font-bold' : ''} ${p.id === room?.turnPlayerId ? 'underline font-semibold' : ''}`}>
                    {p.name} {p.isEliminated && "💀"}
                  </span>
                </span>
                <span className="font-bold text-white">
                  {p.isEliminated ? (language === "fr" ? "Éliminé" : "Eliminated") : `${p.score} pts`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logs timeline panel */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-4 space-y-3">
          <span className="text-xs font-semibold uppercase font-mono tracking-widest text-[#c5a059] block border-b border-zinc-900 pb-2">
            💬 Historique du Salon ({room.code})
          </span>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
            {[...room.logs].reverse().slice(0, 8).map((log, index) => (
              <p key={index} className="text-[11px] text-zinc-400 leading-relaxed truncate">
                {log}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Quit Game button */}
      <div className="flex justify-center">
        <button
          onClick={handleLeaveRoom}
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors border border-zinc-800/40 px-3 py-1.5 rounded-lg hover:border-zinc-700 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> {t.leaveBtn}
        </button>
      </div>
    </div>
  );
}
