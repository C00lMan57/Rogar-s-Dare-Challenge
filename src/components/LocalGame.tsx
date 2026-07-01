import React, { useState, useEffect } from "react";
import { Plus, Trash2, ShieldAlert, Sparkles, Trophy, Users, RefreshCw, Undo2, Smile, AlertTriangle } from "lucide-react";
import ThreeDCard from "./ThreeDCard";
import AISuggestions from "./AISuggestions";
import { Card, Player } from "../types";

interface LocalGameProps {
  language: "fr" | "en";
  onBack: () => void;
}

export default function LocalGame({ language, onBack }: LocalGameProps) {
  // Config state
  const [playerInput, setPlayerInput] = useState("");
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Julie", score: 0, isHost: true, active: true, refusals: 0, currentVote: null },
    { id: "2", name: "Marc", score: 0, isHost: false, active: false, refusals: 0, currentVote: null }
  ]);
  const [selectedDecks, setSelectedDecks] = useState<string[]>(["Soft", "Fun"]);
  const [customCards, setCustomCards] = useState<Card[]>([]);
  const [maxRefusals, setMaxRefusals] = useState(3);
  const [targetScore, setTargetScore] = useState(15);
  const [gameMode, setGameMode] = useState<"points" | "competition">("points");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);

  // Active game state
  const [fullDeck, setFullDeck] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [turnPlayerIndex, setTurnPlayerIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | "none">("none");
  const [logs, setLogs] = useState<string[]>([]);

  // Text translations
  const t = {
    title: language === "fr" ? "Lobby Pass & Play 📱" : "Pass & Play Lobby 📱",
    subtitle: language === "fr" ? "Jouez tous ensemble sur le même écran !" : "Play together around a single screen!",
    playersTitle: language === "fr" ? "Joueurs de la partie" : "Game Players",
    addPlayerPlaceholder: language === "fr" ? "Saisir un nom de joueur..." : "Enter player name...",
    addBtn: language === "fr" ? "Ajouter" : "Add",
    decksTitle: language === "fr" ? "Choisir les Decks" : "Select Decks",
    customSectionTitle: language === "fr" ? "Défis Suprême Secrets" : "Secret Supreme Dares",
    customPlaceholder: language === "fr" ? "Ex: Cap de mimer une machine à laver" : "Ex: Dare to mime a washing machine",
    secretCustomLabel: language === "fr" ? "Ajout secret et anonyme (Suprême)" : "Secret and anonymous add (Supreme)",
    addCustomBtn: language === "fr" ? "Ajouter défi Suprême" : "Add Supreme challenge",
    maxRefusalsLabel: language === "fr" ? "Refus max avant Gage Suprême" : "Max refusals before Supreme Dare",
    targetScoreLabel: language === "fr" ? "Score cible pour gagner la partie" : "Target score to win the game",
    startGameBtn: language === "fr" ? "Lancer la partie ! 🎉" : "Start Game! 🎉",
    turnOf: language === "fr" ? "Au tour de" : "Turn of",
    score: language === "fr" ? "Score" : "Score",
    refusals: language === "fr" ? "Refus" : "Refusals",
    successBtn: language === "fr" ? "Gagné ! (Réussi) ✅" : "Won! (Success) ✅",
    failBtn: language === "fr" ? "Raté ! ❌" : "Failed! ❌",
    impossibleBtn: language === "fr" ? "Pas possible... 🛠️" : "Not possible... 🛠️",
    passBtn: language === "fr" ? "Pas Cap... 🙈" : "Not Daring... 🙈",
    quitBtn: language === "fr" ? "Quitter" : "Quit Game",
    congrats: language === "fr" ? "Bien joué ! Qui sera le vainqueur ?" : "Well played! Who will win?",
    logHeader: language === "fr" ? "Historique des gages" : "Dare logs",
    minPlayersWarning: language === "fr" ? "Veuillez ajouter au moins un joueur." : "Please add at least one player.",
    emptyDeckWarning: language === "fr" ? "Veuillez sélectionner au moins un deck ou ajouter des défis custom !" : "Please select at least one deck or add custom challenges!",
    winnerTitle: language === "fr" ? "🏆 VICTOIRE !" : "🏆 VICTORY!",
    winnerSubtitle: language === "fr" ? "A atteint l'objectif et remporte la partie !" : "Reached the target score and won the game!",
    playAgainBtn: language === "fr" ? "Rejouer" : "Play Again"
  };

  // Predefined cards fallback
  const PREDEFINED_CARDS: Record<string, string[]> = {
    Soft: language === "fr" ? [
      "Cap de faire un compliment sincère et poétique à chaque joueur autour de l'écran.",
      "Cap de parler avec l'accent belge ou canadien pendant les 3 prochains tours.",
      "Cap de chanter en yaourt les premières lignes de ta chanson préférée.",
      "Cap de révéler la dernière recherche Google un peu ridicule que tu as faite sur ton téléphone.",
      "Cap d'imiter une statue célèbre pendant 1 minute complète sans cligner des yeux.",
      "Cap de raconter une blague nulle et d'obliger tout le monde à rire aux éclats.",
      "Cap de mimer un objet du quotidien présent dans la pièce jusqu'à ce que quelqu'un devine.",
      "Cap de faire tenir une cuillère sur ton nez pendant 30 secondes.",
      "Cap de réciter l'alphabet à l'envers le plus vite possible.",
      "Cap de boire un verre d'eau glacée sans utiliser tes mains.",
      "Cap de répéter 5 fois très vite sans bafouiller : « Les chaussettes de l'archiduchesse sont-elles sèches, archisèches ? »",
      "Cap de garder un dictionnaire ou un livre sur ta tête pendant les 2 prochains tours.",
      "Cap de rester sur une jambe les yeux fermés pendant 45 secondes en fredonnant.",
      "Cap de lister 5 de tes plus grandes qualités avec un ton hyper sérieux et dramatique.",
      "Cap de regarder la caméra sans rire ni cligner des yeux pendant 30 secondes pendant que les autres font des grimaces.",
      "Cap de mimer les faits et gestes de la personne en face de toi pendant 1 minute complète.",
      "Cap d'improviser une histoire de 30 secondes contenant les mots « dinosaure », « chaussette » et « président ».",
      "Cap de parler uniquement en rimes pendant ton prochain tour.",
      "Cap de donner un high-five virtuel à l'écran de la manière la plus épique possible.",
      "Cap d'imiter 3 bruits d'animaux différents à la suite et les autres doivent deviner.",
      "Cap de dessiner un chat les yeux fermés en moins de 20 secondes et de montrer le résultat."
    ] : [
      "Dare to give a sincere and poetic compliment to every player in the room.",
      "Dare to speak with a British or Australian accent for the next 3 turns.",
      "Dare to gibberish-sing the first lines of your favorite song.",
      "Dare to reveal the last slightly ridiculous Google search on your phone.",
      "Dare to pose like a famous statue for 1 full minute without blinking.",
      "Dare to tell a terrible joke and make everyone laugh out loud.",
      "Dare to mime an everyday object in the room until someone guesses it.",
      "Dare to balance a spoon on your nose for 30 seconds.",
      "Dare to recite the alphabet backwards as fast as possible.",
      "Dare to drink a glass of cold water without using your hands.",
      "Dare to repeat 5 times fast: 'She sells seashells by the seashore' without stumbling.",
      "Dare to balance a thick book on your head for the next 2 turns.",
      "Dare to stand on one leg with your eyes closed for 45 seconds while humming.",
      "Dare to list 5 of your greatest traits with an ultra-serious and dramatic tone.",
      "Dare to look at the screen without laughing or blinking for 30 seconds while others make funny faces.",
      "Dare to mimic every movement of the person opposite you for 1 complete minute.",
      "Dare to improvise a 30-second story containing the words 'dinosaur', 'sock', and 'president'.",
      "Dare to speak only in rhymes for your next turn.",
      "Dare to give a virtual high-five to the screen in the most epic way possible.",
      "Dare to imitate 3 different animal noises in a row and have the others guess what they are.",
      "Dare to draw a cat with your eyes closed in under 20 seconds and show the result."
    ],
    Fun: language === "fr" ? [
      "Cap de mimer un poulet paniqué qui pond un œuf d'or pendant 30 secondes.",
      "Cap de faire une déclaration d'amour digne d'un opéra dramatique à une chaise de la pièce.",
      "Cap de danser la salsa pendant 1 minute complète... mais sans aucune musique !",
      "Cap de faire croire par message à un de tes contacts (choisi par le groupe) que tu as gagné au loto.",
      "Cap d'essayer de toucher ton nez avec ta langue en faisant les yeux ronds.",
      "Cap de faire une grimace tellement horrible que tout le monde doit se cacher les yeux.",
      "Cap de raconter l'histoire du Petit Chaperon Rouge en version rap ou slam.",
      "Cap de porter toutes tes chaussettes ou chaussures à l'envers jusqu'à la fin de la partie.",
      "Cap de mimer un paresseux qui boit son café du matin pendant 45 secondes.",
      "Cap de faire semblant d'être un commentateur sportif qui commente les moindres faits et gestes d'un autre joueur.",
      "Cap de marcher et parler au ralenti de manière ultra-exagérée pendant 1 minute entière.",
      "Cap de faire du hula-hoop imaginaire de manière très énergique pendant 45 secondes.",
      "Cap de parler comme un robot en traduisant toutes tes émotions (« BIP BOU_P, INITIALISATION DE LA COLÈRE ») pendant le tour complet.",
      "Cap de simuler un rire de méchant de dessin animé ultra-maléfique pendant 30 secondes sans t'arrêter.",
      "Cap de chanter tout ce que tu dis d'une voix d'opéra dramatique pendant ton prochain tour.",
      "Cap de mettre une chaussette sur ta main et de l'utiliser comme marionnette pour raconter une blague ou répondre aux autres.",
      "Cap de simuler une scène de mort ultra-dramatique digne d'un film hollywoodien.",
      "Cap de regarder la caméra et de faire un rapport ultra-sérieux à tes dirigeants extraterrestres sur le comportement bizarre des humains présents.",
      "Cap de mimer un chef cuisinier français très en colère contre sa mayonnaise ratée pendant 45 secondes.",
      "Cap d'agir comme si tu étais un chat jaloux et câlin pendant les 2 prochains tours."
    ] : [
      "Dare to mime a panicked chicken laying a golden egg for 30 seconds.",
      "Dare to make a dramatic opera-style love declaration to a chair in the room.",
      "Dare to dance the salsa for 1 full minute... but with absolutely no music!",
      "Dare to text a contact (chosen by the group) and make them believe you won the lottery.",
      "Dare to try to touch your nose with your tongue while crossing your eyes.",
      "Dare to make a face so scary or ridiculous that everyone must cover their eyes.",
      "Dare to retell Little Red Riding Hood as a rap or slam poem.",
      "Dare to wear your socks or shoes backwards until the end of the game.",
      "Dare to mime a sloth drinking its morning coffee for 45 seconds.",
      "Dare to commentate on another player's actions like an excited sports commentator.",
      "Dare to walk and talk in ultra-exaggerated slow motion for 1 complete minute.",
      "Dare to do imaginary hula-hooping very energetically for 45 seconds.",
      "Dare to talk like a robot, declaring all your emotions out loud for the whole round.",
      "Dare to fake an ultra-evil cartoon villain laugh for 30 seconds without stopping.",
      "Dare to sing everything you say in a dramatic opera voice for your next turn.",
      "Dare to put a sock on your hand and use it as a puppet to tell a joke or talk to others.",
      "Dare to act out a highly dramatic, slow-motion Hollywood death scene.",
      "Dare to look at the screen and deliver a highly serious report to your alien leaders about the strange behavior of the humans in the room.",
      "Dare to mime a fancy French chef extremely angry because his mayonnaise failed for 45 seconds.",
      "Dare to act like a needy and jealous house cat for the next 2 turns."
    ],
    Hard: language === "fr" ? [
      "Cap de laisser les autres joueurs envoyer un message complètement loufoque à l'un de tes contacts récents.",
      "Cap de révéler ton moment le plus honteux ou embarrassant de ta vie scolaire ou pro.",
      "Cap de faire 20 pompes rapides tout en imitant le cri d'un phoque affamé à chaque pompe.",
      "Cap de manger une cuillère de moutarde forte ou de sauce piquante sans verser de larme.",
      "Cap de montrer à l'écran la photo la plus embarrassante de ta galerie photo.",
      "Cap d'appeler un numéro au hasard et d'essayer de lui vendre une chaussette imaginaire pendant 1 minute.",
      "Cap de laisser un autre joueur dessiner une petite moustache farfelue sur ton visage au feutre (ou de la simuler avec du maquillage).",
      "Cap de révéler qui est la personne ici présente avec qui tu t'entendrais le moins bien sur une île déserte, et d'expliquer pourquoi.",
      "Cap de faire une chorégraphie de claquettes improvisée et ultra-rapide sur le sol.",
      "Cap de révéler la pire bêtise que tu as faite et que tes parents ne savent toujours pas.",
      "Cap de glisser un glaçon dans ton t-shirt/dos et de chanter l'hymne national en entier sans bouger.",
      "Cap d'appeler un commerce local (ex: pizzeria) avec un accent très prononcé pour demander s'ils vendent des pneus de rechange pour trottinettes.",
      "Cap d'être bandé les yeux et de deviner 3 objets différents uniquement en les sentant ou en les touchant avec le pied.",
      "Cap d'enfiler tous tes vêtements à l'envers (t-shirt, pantalon, chaussettes) et de faire une déclaration de combat héroïque contre un dragon imaginaire.",
      "Cap de parler avec une voix super aiguë d'hélium pendant les 3 prochains tours sous peine d'un autre gage de la honte."
    ] : [
      "Dare to let other players send a completely wacky text message to one of your recent contacts.",
      "Dare to reveal the most embarrassing or shameful moment of your school or professional life.",
      "Dare to do 20 fast pushups while making hungry seal sounds on each rep.",
      "Dare to eat a spoonful of strong mustard or hot sauce without shedding a tear.",
      "Dare to show the single most embarrassing photo in your phone gallery.",
      "Dare to call a random number and try to sell them an imaginary sock for 1 minute.",
      "Dare to let another player draw a tiny funny mustache on your face with a pen (or simulate it).",
      "Dare to reveal who among the players you would get along with the least on a desert island, and explain why.",
      "Dare to do a fast, improvised tap dance routine on the floor.",
      "Dare to reveal the worst trouble you got into that your parents still don't know about.",
      "Dare to drop an ice cube down your shirt/back and sing the national anthem without flinching.",
      "Dare to call a local shop using a thick fake accent and ask if they sell replacement wheels for toy scooters.",
      "Dare to be blindfolded and guess 3 random objects using only your sense of smell or touch with your foot.",
      "Dare to wear all your clothes backward (shirt, pants, socks) and deliver a heroic battle speech against an imaginary dragon.",
      "Dare to talk in a super high-pitched helium voice for the next 3 turns or face an automatic shame penalty."
    ],
    Caliente: language === "fr" ? [
      "Cap de faire ton regard le plus séducteur et ensorcelant à la caméra pendant 15 secondes d'affilée sans rire.",
      "Cap de raconter l'histoire de ton tout premier baiser romantique avec un maximum de détails passionnés.",
      "Cap de révéler ton plus grand plaisir coupable ou ton fantasme secret le plus drôle.",
      "Cap de mimer un massage d'épaules virtuel super sensuel et exagéré.",
      "Cap de chuchoter un secret d'une voix ultra-suave et sexy à la caméra.",
      "Cap de faire un baiser volant ultra-théâtral à la personne de ton choix.",
      "Cap de danser de manière provocante et drôle sur une musique imaginaire pendant 30 secondes.",
      "Cap de révéler quelle est la première chose physique qui t'attire chez quelqu'un.",
      "Cap de mimer une scène de séduction d'un film célèbre avec toi-même.",
      "Cap de chanter un refrain romantique en regardant intensément la caméra.",
      "Cap d'enlacer la personne à ta droite au ralenti de manière ultra-cinématographique pendant 15 secondes.",
      "Cap de regarder un autre joueur dans les yeux pendant 30 secondes d'affilée sans cligner ni parler, les yeux dans les yeux.",
      "Cap d'approcher ton micro et de dire la phrase la plus séductrice possible avec ta voix la plus basse et sensuelle.",
      "Cap de décrire en détail ton rendez-vous galant absolument parfait et idéal.",
      "Cap de lister 3 parties du corps que tu apprécies particulièrement chez toi ou chez un autre joueur avec élégance.",
      "Cap de fermer les yeux, de laisser un joueur te dessiner une forme sur le dos ou le bras avec son doigt, et de deviner ce que c'est."
    ] : [
      "Dare to give your most seductive and enchanting look to the camera for 15 seconds without laughing.",
      "Dare to tell the story of your very first romantic kiss with lots of passionate and dramatic details.",
      "Dare to reveal your biggest guilty pleasure or funniest secret fantasy.",
      "Dare to mime a highly sensual and exaggerated virtual shoulder massage.",
      "Dare to whisper a secret in an ultra-suave, sexy voice to the camera.",
      "Dare to blow an incredibly theatrical kiss to the person of your choice.",
      "Dare to dance in a funny, provocative way to imaginary music for 30 seconds.",
      "Dare to reveal the first physical thing that attracts you to someone.",
      "Dare to mime a famous seduction scene from a movie acting as both characters.",
      "Dare to sing a romantic love chorus while staring intensely at the camera.",
      "Dare to hug the person on your right in dramatic slow motion for 15 seconds.",
      "Dare to hold eye contact with another player for 30 seconds straight without speaking or blinking.",
      "Dare to lean into your mic and whisper the most seductive phrase with your deepest, smoothest voice.",
      "Dare to describe in vivid detail your absolute perfect and ideal romantic date.",
      "Dare to list 3 body parts you appreciate most about yourself or another player with elegance.",
      "Dare to close your eyes, let a player draw a shape on your back or arm with their finger, and guess what it is."
    ],
    Honte: language === "fr" ? [
      "DÉFI DE LA HONTE ! Cap de danser la danse des canards pendant 1 minute en chantant à tue-tête.",
      "DÉFI DE LA HONTE ! Cap de faire une déclaration d'amour enflammée à ton orteil gauche pendant 30 secondes.",
      "DÉFI DE LA HONTE ! Cap de te coiffer de la manière la plus ridicule possible avec du scotch, du gel ou des pinces et de rester ainsi.",
      "DÉFI DE LA HONTE ! Cap de chanter tout ce que tu dis pendant les 2 prochains tours.",
      "DÉFI DE LA HONTE ! Cap de simuler une conversation animée avec une plante verte pendant 45 secondes.",
      "DÉFI DE LA HONTE ! Cap de faire le bruit et le comportement d'un aspirateur en train de nettoyer la pièce pendant 1 minute complète.",
      "DÉFI DE LA HONTE ! Cap de faire semblant d'être une mouche coincée contre une vitre en faisant 'BZZZ' et en tournant sur toi-même pendant 45 secondes.",
      "DÉFI DE LA HONTE ! Cap de pleurer à chaudes larmes pendant 30 secondes pour une raison complètement ridicule (ex: « le brocoli est trop vert »).",
      "DÉFI DE LA HONTE ! Cap d'imiter un chien excité qui attend sa balle pendant 45 secondes (haleter, remuer la queue imaginaire).",
      "DÉFI DE LA HONTE ! Cap de parler uniquement en langage bébé ('gaga boubou') pendant ton prochain tour complet.",
      "DÉFI DE LA HONTE ! Cap de te disputer violemment avec ton propre reflet dans un miroir pendant 1 minute.",
      "DÉFI DE LA HONTE ! Cap d'imiter un gorille en colère en te tapant la poitrine et en hurlant pendant 30 secondes.",
      "DÉFI DE LA HONTE ! Cap de sentir publiquement ta propre chaussette à la fin de ton tour et de donner une note sur 10 avec un sérieux professionnel.",
      "DÉFI DE LA HONTE ! Cap de faire le tour de la pièce à quatre pattes à l'envers (comme un crabe) en disant 'Je suis un crabe royal'.",
      "DÉFI DE LA HONTE ! Cap de chanter une excuse solennelle d'opéra à haute voix en t'excusant auprès de l'univers pour tes 3 lâches refus de défis."
    ] : [
      "SHAME DARE! Dare to dance the chicken dance for 1 minute while singing at the top of your lungs.",
      "SHAME DARE! Dare to make a passionate love declaration to your left big toe for 30 seconds.",
      "SHAME DARE! Dare to style your hair in the most ridiculous way possible using tape, gel, or clips and keep it that way.",
      "SHAME DARE! Dare to sing everything you say for the next 2 turns.",
      "SHAME DARE! Dare to simulate an intense conversation with a houseplant for 45 seconds.",
      "SHAME DARE! Dare to make vacuum cleaner sounds and crawl around 'cleaning' the room for 1 full minute.",
      "SHAME DARE! Dare to pretend you are a fly stuck against a window, making loud 'BZZZ' sounds and spinning around for 45 seconds.",
      "SHAME DARE! Dare to sob dramatically for 30 seconds over a ridiculous reason (e.g., 'why is broccoli so green?').",
      "SHAME DARE! Dare to pretend you are an excited dog waiting for a ball for 45 seconds (panting, wagging an imaginary tail).",
      "SHAME DARE! Dare to talk only in baby language ('gaga gougou') for your entire next turn.",
      "SHAME DARE! Dare to have a loud, angry argument with your own reflection in a mirror for 1 full minute.",
      "SHAME DARE! Dare to act like an angry gorilla, beating your chest and making loud gorilla noises for 30 seconds.",
      "SHAME DARE! Dare to publicly sniff your own sock and give it a rating out of 10 with professional seriousness.",
      "SHAME DARE! Dare to crawl backwards around the room like a crab while repeating 'I am a royal crab!'",
      "SHAME DARE! Dare to sing a majestic opera apology to the universe for your 3 cowardly dare refusals."
    ]
  };

  // Add standard player
  const handleAddPlayer = () => {
    if (!playerInput.trim()) return;
    const isFirst = players.length === 0;
    const newPlayer: Player = {
      id: "p_" + Math.random().toString(36).substr(2, 9),
      name: playerInput.trim(),
      score: 0,
      isHost: isFirst,
      active: isFirst,
      refusals: 0,
      currentVote: null
    };
    setPlayers([...players, newPlayer]);
    setPlayerInput("");
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // Toggle active deck selection
  const handleToggleDeck = (deck: string) => {
    if (selectedDecks.includes(deck)) {
      setSelectedDecks(selectedDecks.filter(d => d !== deck));
    } else {
      setSelectedDecks([...selectedDecks, deck]);
    }
  };

  // Add individual custom card
  const [customInput, setCustomInput] = useState("");
  const handleAddCustomCard = (text: string, isFromAI = false) => {
    const cardText = text || customInput.trim();
    if (!cardText) return;

    const newCard: Card = {
      id: "card_custom_" + Math.random().toString(36).substr(2, 9),
      text: cardText,
      category: "Supreme",
      creator: isFromAI ? "Gemini AI" : (language === "fr" ? "Secret" : "Secret")
    };

    setCustomCards(prev => [...prev, newCard]);
    if (!text) setCustomInput("");
  };

  // Mix AI dares
  const handleAddAIDares = (dares: string[]) => {
    const newCards = dares.map(text => ({
      id: "card_ai_" + Math.random().toString(36).substr(2, 9),
      text,
      category: "Custom" as const,
      creator: "Gemini AI"
    }));
    setCustomCards(prev => [...prev, ...newCards]);
  };

  // Shuffle Algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Start the actual game!
  const handleStartGame = () => {
    if (players.length === 0) {
      alert(t.minPlayersWarning);
      return;
    }
    if (gameMode === "competition" && players.length < 2) {
      alert(language === "fr" ? "Le mode Compétition requiert au moins 2 joueurs !" : "Competition mode requires at least 2 players!");
      return;
    }
    if (selectedDecks.length === 0 && customCards.length === 0) {
      alert(t.emptyDeckWarning);
      return;
    }

    // Assembly
    let assembled: Card[] = [];

    // Official chosen decks
    selectedDecks.forEach(deckName => {
      const texts = PREDEFINED_CARDS[deckName] || [];
      texts.forEach((text, idx) => {
        assembled.push({
          id: `card_${deckName}_${idx}`,
          text,
          category: deckName as any
        });
      });
    });

    // Custom decks
    customCards.forEach(c => assembled.push(c));

    if (assembled.length === 0) return;

    // Shuffle
    const shuffled = shuffleArray(assembled);
    setFullDeck(shuffled);
    setCurrentCardIndex(0);
    setCurrentCard(shuffled[0]);
    setIsCardFlipped(false);

    // Reset players scores/refusals
    const resetPlayers = players.map((p, idx) => ({
      ...p,
      score: 0,
      refusals: 0,
      active: idx === 0
    }));
    setPlayers(resetPlayers);
    setTurnPlayerIndex(0);

    setLogs([language === "fr" ? "🎉 La partie commence !" : "🎉 Game started!"]);
    setIsGameStarted(true);
  };

  // Gameplay actions
  const activePlayer = players[turnPlayerIndex];

  const handleCardFlip = () => {
    if (!isCardFlipped) {
      setIsCardFlipped(true);
      setLogs(prev => [
        `${activePlayer.name} dit : "CAP !" et retourne la carte... 🫵`,
        ...prev
      ]);
    }
  };

  const handleSuccess = () => {
    // Points depending on category
    const pts = currentCard?.category === "Hard" || currentCard?.category === "Honte" ? 3 : currentCard?.category === "Caliente" ? 2 : 1;
    
    // Update active player's score
    const updatedPlayers = [...players];
    const newScore = updatedPlayers[turnPlayerIndex].score + pts;
    updatedPlayers[turnPlayerIndex].score = newScore;
    updatedPlayers[turnPlayerIndex].refusals = 0; // reset refusals upon success
    setPlayers(updatedPlayers);

    setLogs(prev => [
      `✅ ${activePlayer.name} a RÉUSSI le défi ! (+${pts} Pt${pts > 1 ? 's' : ''})`,
      ...prev
    ]);

    if (gameMode === "points" && newScore >= targetScore) {
      setLogs(prev => [
        `🏆 VICTOIRE ! ${activePlayer.name} a atteint ${newScore} points et gagne la partie !`,
        ...prev
      ]);
      setWinner(updatedPlayers[turnPlayerIndex]);
      setIsGameOver(true);
      return;
    }

    setSlideDirection("right");
    setTimeout(() => {
      advanceNextTurn(updatedPlayers);
    }, 300);
  };

  const triggerSupremeLocal = (currentPlayersList: Player[], playerIdx: number) => {
    setIsCardFlipped(false);
    setSlideDirection("none");
    
    const targetPlayer = currentPlayersList[playerIdx];
    const supremeList = customCards;
    const supremeText = supremeList.length > 0
      ? supremeList[Math.floor(Math.random() * supremeList.length)].text
      : (language === "fr" ? "DÉFI SUPRÊME : Fais quelque chose de vraiment gênant pour tout le monde !" : "SUPREME DARE: Do something truly embarrassing for everyone!");

    setCurrentCard({
      id: "card_supreme_" + Math.random().toString(36).substring(2, 9),
      text: supremeText,
      category: "Supreme",
    });

    // Reset player's refusals count
    const fixedPlayers = [...currentPlayersList];
    fixedPlayers[playerIdx].refusals = 0;
    // Keep turn player index as playerIdx
    setTurnPlayerIndex(playerIdx);
    setPlayers(fixedPlayers.map((p, i) => ({
      ...p,
      active: i === playerIdx
    })));

    setLogs(prev => [
      `⚠️ ALERTE SUPRÊME ! ${targetPlayer.name} a atteint le max de refus ! Il doit obligatoirement relever un défi suprême !`,
      ...prev
    ]);
  };

  const handleSupremeEliminate = () => {
    const updatedPlayers = [...players];
    updatedPlayers[turnPlayerIndex].isEliminated = true;
    updatedPlayers[turnPlayerIndex].active = false;
    setPlayers(updatedPlayers);

    setLogs(prev => [
      `💀 ${activePlayer.name} a échoué au DÉFI SUPRÊME et est éliminé de la partie !`,
      ...prev
    ]);

    const activePlayersList = updatedPlayers.filter(p => !p.isEliminated);
    
    if (activePlayersList.length <= 1) {
      setIsGameOver(true);
      if (activePlayersList.length === 1) {
        setWinner(activePlayersList[0]);
        setLogs(prev => [
          `🏆 VICTOIRE ! ${activePlayersList[0].name} est le dernier survivant et remporte la partie !`,
          ...prev
        ]);
      } else {
        setWinner(null);
        setLogs(prev => [
          `💀 Tout le monde a été éliminé ! Personne ne gagne la partie.`,
          ...prev
        ]);
      }
      return;
    }

    setSlideDirection("left");
    setTimeout(() => {
      advanceNextTurn(updatedPlayers);
    }, 300);
  };

  const handleFail = () => {
    // Increment refusals count
    const updatedPlayers = [...players];
    updatedPlayers[turnPlayerIndex].refusals += 1;
    setPlayers(updatedPlayers);

    setLogs(prev => [
      `❌ ${activePlayer.name} a RATÉ le défi ! (+1 Refus : ${updatedPlayers[turnPlayerIndex].refusals}/${maxRefusals})`,
      ...prev
    ]);

    if (updatedPlayers[turnPlayerIndex].refusals >= maxRefusals) {
      setTimeout(() => {
        triggerSupremeLocal(updatedPlayers, turnPlayerIndex);
      }, 300);
    } else {
      setSlideDirection("left");
      setTimeout(() => {
        advanceNextTurn(updatedPlayers);
      }, 300);
    }
  };

  const handleImpossible = () => {
    // Dock 1 point & increment refusal count
    const updatedPlayers = [...players];
    updatedPlayers[turnPlayerIndex].score = Math.max(0, updatedPlayers[turnPlayerIndex].score - 1);
    updatedPlayers[turnPlayerIndex].refusals += 1;
    setPlayers(updatedPlayers);

    setLogs(prev => [
      `🛠️ ${activePlayer.name} dit : "PAS POSSIBLE..." (-1 Point, Refus : ${updatedPlayers[turnPlayerIndex].refusals}/${maxRefusals})`,
      ...prev
    ]);

    if (updatedPlayers[turnPlayerIndex].refusals >= maxRefusals) {
      setTimeout(() => {
        triggerSupremeLocal(updatedPlayers, turnPlayerIndex);
      }, 300);
    } else {
      setSlideDirection("left");
      setTimeout(() => {
        advanceNextTurn(updatedPlayers);
      }, 300);
    }
  };

  const handlePass = () => {
    // Dock 1 point & increment refusal count
    const updatedPlayers = [...players];
    updatedPlayers[turnPlayerIndex].score = Math.max(0, updatedPlayers[turnPlayerIndex].score - 1);
    updatedPlayers[turnPlayerIndex].refusals += 1;
    setPlayers(updatedPlayers);

    setLogs(prev => [
      `🙈 ${activePlayer.name} dit : "PAS CAP..." (-1 Point, Refus : ${updatedPlayers[turnPlayerIndex].refusals}/${maxRefusals})`,
      ...prev
    ]);

    if (updatedPlayers[turnPlayerIndex].refusals >= maxRefusals) {
      setTimeout(() => {
        triggerSupremeLocal(updatedPlayers, turnPlayerIndex);
      }, 300);
    } else {
      setSlideDirection("left");
      setTimeout(() => {
        advanceNextTurn(updatedPlayers);
      }, 300);
    }
  };

  const advanceNextTurn = (currentPlayersList: Player[]) => {
    setIsCardFlipped(false);
    setSlideDirection("none");

    let nextIdx = (turnPlayerIndex + 1) % currentPlayersList.length;
    // Skip eliminated players
    while (currentPlayersList[nextIdx].isEliminated) {
      nextIdx = (nextIdx + 1) % currentPlayersList.length;
    }
    
    setTurnPlayerIndex(nextIdx);

    const nextPlayer = currentPlayersList[nextIdx];

    // Mark active player
    setPlayers(currentPlayersList.map((p, i) => ({
      ...p,
      active: i === nextIdx
    })));

    // Next Card index
    const nextCardIdx = currentCardIndex + 1;

    // We no longer trigger supreme here, because it's triggered immediately on failure/pass of the active player
    if (nextCardIdx >= fullDeck.length) {
      // Shuffle again
      const reshuffled = shuffleArray(fullDeck);
      setFullDeck(reshuffled);
      setCurrentCardIndex(0);
      setCurrentCard(reshuffled[0]);
      setLogs(prev => [
        "🔄 Toutes les cartes ont été piochées ! Le deck est re-mélangé.",
        ...prev
      ]);
    } else {
      setCurrentCardIndex(nextCardIdx);
      setCurrentCard(fullDeck[nextCardIdx]);
    }
  };

  const handleReset = () => {
    setIsGameStarted(false);
    setIsGameOver(false);
    setWinner(null);
    setPlayers(players.map(p => ({ ...p, score: 0, refusals: 0 })));
    setCustomCards([]);
    setLogs([]);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto py-4 px-2 transition-colors duration-500 ${currentCard?.category === "Supreme" ? "bg-red-950/20" : ""}`} id="local-game-container">
      {isGameStarted && isGameOver ? (
        /* GAME OVER / WINNER CELEBRATION SCREEN */
        <div className="space-y-6 text-center py-10 animate-fade-in" id="victory-screen">
          <div className="relative inline-block">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-75 blur-lg animate-pulse" />
            <div className="relative bg-zinc-950 border-2 border-[#c5a059] p-8 rounded-full inline-flex items-center justify-center">
              <Trophy className="w-16 h-16 text-[#c5a059]" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tight text-[#c5a059]">
              {t.winnerTitle}
            </h2>
            <p className="text-white text-xl font-bold">
              🎉 {winner?.name} 🎉
            </p>
            <p className="text-zinc-400 text-sm">
              {gameMode === "points" 
                ? `${t.winnerSubtitle} (${winner?.score} / ${targetScore} pts)`
                : (language === "fr" ? "Dernier survivant de la compétition ! 💀" : "Last survivor of the competition! 💀")}
            </p>
          </div>

          {/* Final Standings Grid */}
          <div className="glass-panel rounded-2xl p-5 max-w-md mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase font-mono tracking-widest text-[#c5a059] block border-b border-zinc-900 pb-2">
              🏆 {language === "fr" ? "Classement Final" : "Final Standings"}
            </span>
            <div className="space-y-2.5">
              {[...players].sort((a,b) => {
                if (a.isEliminated && !b.isEliminated) return 1;
                if (!a.isEliminated && b.isEliminated) return -1;
                return b.score - a.score;
              }).map((p, idx) => (
                <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-zinc-950/40 border border-zinc-900/40">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <span className="font-mono text-[#c5a059] font-bold">#{idx+1}</span>
                    <span className={p.id === winner?.id ? "text-[#c5a059] font-black" : ""}>
                      {p.name} {p.isEliminated && "💀"}
                    </span>
                  </span>
                  <span className="font-extrabold text-white">
                    {p.isEliminated 
                      ? (language === "fr" ? "Éliminé 💀" : "Eliminated 💀") 
                      : (gameMode === "points" 
                        ? `${p.score} pts` 
                        : (language === "fr" ? "Survivant 🎉" : "Survivor 🎉"))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="px-8 py-3 bg-[#c5a059] hover:bg-[#d9b673] text-zinc-950 font-bold rounded-xl tracking-wider shadow-lg shadow-[#c5a059]/20 transition-all active:scale-95 text-sm cursor-pointer"
          >
            {t.playAgainBtn}
          </button>
        </div>
      ) : !isGameStarted ? (
        /* LOBBY CONFIGURATION SCREEN */
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white bg-linear-to-b from-white via-zinc-200 to-[#c5a059] bg-clip-text text-transparent">
              {t.title}
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PLAYERS MANAGEMENT CARD */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <span className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#c5a059]" /> {t.playersTitle}
                </span>
                <span className="text-xs bg-zinc-950/60 px-2.5 py-1 rounded-full text-zinc-400 font-mono border border-zinc-800/40">
                  {players.length} joueur(s)
                </span>
              </div>

              {/* Player Add Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={playerInput}
                  onChange={e => setPlayerInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddPlayer()}
                  placeholder={t.addPlayerPlaceholder}
                  className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#c5a059]"
                />
                <button
                  onClick={handleAddPlayer}
                  className="bg-[#c5a059] hover:bg-[#d9b673] text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {t.addBtn}
                </button>
              </div>

              {/* Players list */}
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {players.map((p, idx) => (
                  <div key={p.id} className="flex justify-between items-center bg-zinc-950/40 border border-zinc-900/60 p-2 rounded-xl">
                    <span className="text-xs text-zinc-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center text-[10px] font-mono border border-[#c5a059]/30">
                        {idx + 1}
                      </span>
                      {p.name}
                    </span>
                    <button
                      onClick={() => handleRemovePlayer(p.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* DECK SELECTOR CARD */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <span className="text-sm font-semibold text-white tracking-wide block border-b border-zinc-800/80 pb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#c5a059]" /> {t.decksTitle}
              </span>

              <div className="grid grid-cols-2 gap-2">
                {["Soft", "Fun", "Hard", "Caliente"].map(deckName => {
                  const isSelected = selectedDecks.includes(deckName);
                  const colors = {
                    Soft: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
                    Fun: "border-purple-500/50 text-purple-400 bg-purple-500/10",
                    Hard: "border-red-500/50 text-red-400 bg-red-500/10",
                    Caliente: "border-pink-500/50 text-pink-400 bg-pink-500/10"
                  }[deckName];

                  return (
                    <button
                      key={deckName}
                      onClick={() => handleToggleDeck(deckName)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isSelected
                          ? `${colors} border-opacity-100 ring-1 ring-[#c5a059]/30`
                          : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {deckName}
                    </button>
                  );
                })}
              </div>

              {/* Game Mode Selector */}
              <div className="bg-zinc-950/40 border border-zinc-900/60 p-3 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#c5a059] block">
                  {language === "fr" ? "🏆 MODE DE JEU" : "🏆 GAME MODE"}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGameMode("points")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      gameMode === "points"
                        ? "bg-[#c5a059] text-zinc-950"
                        : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    🎯 {language === "fr" ? "Points" : "Points"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGameMode("competition")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      gameMode === "competition"
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    💀 {language === "fr" ? "Compétition" : "Competition"}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  {gameMode === "points"
                    ? (language === "fr" ? "Atteignez le score cible en réussissant des gages." : "Reach the target score by succeeding at dares.")
                    : (language === "fr" ? "Pas d'objectif de points. Échouer à un défi suprême élimine le joueur. Le dernier survivant gagne ! 🔥" : "No points objective. Failing a supreme dare eliminates the player. Last survivor wins! 🔥")}
                </p>
              </div>

              {/* Max Refusals Slider */}
              <div className="bg-zinc-950/40 border border-zinc-900/60 p-3 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-[#c5a059]">
                  <span>{t.maxRefusalsLabel}</span>
                  <span className="text-[#c5a059] font-bold">{maxRefusals} {language === "fr" ? "refus" : "refusals"}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="5"
                  value={maxRefusals}
                  onChange={e => setMaxRefusals(parseInt(e.target.value))}
                  className="w-full accent-[#c5a059] bg-zinc-900 cursor-pointer"
                />
              </div>

              {/* Target Score Slider */}
              {gameMode === "points" && (
                <div className="bg-zinc-950/40 border border-zinc-900/60 p-3 rounded-xl space-y-1.5 animate-fade-in">
                  <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-[#c5a059]">
                    <span>{t.targetScoreLabel}</span>
                    <span className="text-[#c5a059] font-bold">{targetScore} {language === "fr" ? "pts" : "pts"}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={targetScore}
                    onChange={e => setTargetScore(parseInt(e.target.value))}
                    className="w-full accent-[#c5a059] bg-zinc-900 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* CUSTOM DECKS SECTION */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <span className="text-sm font-semibold text-white tracking-wide block border-b border-zinc-800/80 pb-3 flex items-center gap-2">
              <Smile className="w-4 h-4 text-[#c5a059]" /> {t.customSectionTitle}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Manual Custom Input */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <textarea
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder={t.customPlaceholder}
                    rows={2}
                    className="flex-1 bg-zinc-950 border border-zinc-800/85 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-hidden focus:border-[#c5a059] resize-none"
                  />
                </div>
                <button
                  onClick={() => handleAddCustomCard(customInput)}
                  className="w-full bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border border-[#c5a059]/30 text-[#c5a059] text-xs font-semibold py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  {t.addCustomBtn}
                </button>

                {/* Secret Custom cards count */}
                {customCards.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-center">
                    <span className="text-xs text-[#c5a059] font-semibold tracking-wide">
                      🔒 {customCards.length} défi(s) custom secret(s) dans le deck
                    </span>
                    <button
                      onClick={() => setCustomCards([])}
                      className="text-[10px] text-red-400 hover:underline block mx-auto mt-1 cursor-pointer"
                    >
                      Effacer tout
                    </button>
                  </div>
                )}
              </div>

              {/* AI generator Suggestions */}
              <div>
                <AISuggestions onAddDares={handleAddAIDares} language={language} />
              </div>
            </div>
          </div>

          {/* Master Start Button */}
          <button
            onClick={handleStartGame}
            className="w-full bg-[#c5a059] hover:bg-[#d9b673] text-zinc-950 font-black py-4 rounded-2xl tracking-widest shadow-lg shadow-[#c5a059]/25 transition-all active:scale-[0.99] cursor-pointer text-xs uppercase"
          >
            {t.startGameBtn}
          </button>
        </div>
      ) : (
        /* ACTIVE IN-GAME SCREEN */
        <div className="space-y-6">
          {/* Active Turn Header */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#c5a059] text-zinc-950 flex items-center justify-center font-black text-lg shadow-sm shadow-[#c5a059]/30">
                {activePlayer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#c5a059]">
                  {t.turnOf}
                </span>
                <h3 className="text-white font-bold text-base leading-tight">
                  {activePlayer.name}
                </h3>
              </div>
            </div>

            {/* Score and refusals pills */}
            <div className="flex gap-2">
              <div className="bg-zinc-950 border border-zinc-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-[#c5a059]">{t.score}</span>
                <span className="text-white font-extrabold text-sm">{activePlayer.score}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-[#c5a059]">{t.refusals}</span>
                <span className={`font-extrabold text-sm ${activePlayer.refusals >= maxRefusals - 1 ? 'text-[#ff3e3e]' : 'text-zinc-300'}`}>
                  {activePlayer.refusals}/{maxRefusals}
                </span>
              </div>
            </div>
          </div>

          {/* 3D Card Area */}
          <div className="py-2">
            <ThreeDCard
              card={currentCard}
              isFlipped={isCardFlipped}
              onFlip={handleCardFlip}
              direction={slideDirection}
            />
          </div>

          {/* Actions Controls panel */}
          <div className="max-w-[340px] mx-auto space-y-2">
            {isCardFlipped ? (
              currentCard?.category === "Supreme" ? (
                /* Supreme Dare revealed: show Success or Lost/Eliminated */
                <div className="flex flex-col gap-2 animate-fade-in">
                  <button
                    onClick={handleSuccess}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-colors cursor-pointer text-center"
                  >
                    {language === "fr" ? "Réussi 🎉" : "Succeeded 🎉"}
                  </button>
                  <button
                    onClick={handleSupremeEliminate}
                    className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-colors cursor-pointer text-center"
                  >
                    {language === "fr" ? "Perdu Élimination 💀" : "Lost Elimination 💀"}
                  </button>
                </div>
              ) : (
                /* If card flipped, other players validate success or fail */
                <div className="flex gap-2 animate-fade-in">
                  <button
                    onClick={handleSuccess}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {t.successBtn}
                  </button>
                  <button
                    onClick={handleFail}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    {t.failBtn}
                  </button>
                  <button
                    onClick={handleImpossible}
                    className="flex-1 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    {t.impossibleBtn}
                  </button>
                </div>
              )
            ) : (
              /* If card face-down, active player can click 'PAS CAP' to bypass if NOT Supreme */
              currentCard?.category !== "Supreme" && (
                <button
                  onClick={handlePass}
                  disabled={currentCard?.category === "Honte"}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors shadow-xs cursor-pointer flex justify-center items-center gap-1.5"
                >
                  {t.passBtn}
                </button>
              )
            )}

            {currentCard?.category === "Honte" && !isCardFlipped && (
              <div className="flex justify-center items-center gap-1.5 text-amber-400 text-[10px] font-mono animate-pulse mt-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>GAGE DE LA HONTE OBLIGATOIRE !</span>
              </div>
            )}
          </div>

          {/* LOGS / TIMELINE & SCORES PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-900 pt-5">
            {/* Realtime Score board */}
            <div className="md:col-span-1 glass-panel rounded-2xl p-4 space-y-3">
              <span className="text-xs font-semibold uppercase font-mono tracking-widest text-[#c5a059] block border-b border-zinc-900 pb-2">
                🏆 {gameMode === "points" ? t.score : (language === "fr" ? "Survivants" : "Survivors")}
              </span>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                {[...players].sort((a,b) => {
                  if (a.isEliminated && !b.isEliminated) return 1;
                  if (!a.isEliminated && b.isEliminated) return -1;
                  return b.score - a.score;
                }).map((p, idx) => (
                  <div key={p.id} className={`flex justify-between items-center text-xs ${p.isEliminated ? 'opacity-50' : ''}`}>
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <span className="font-mono text-zinc-600 text-[10px]">#{idx+1}</span>
                      <span className={`${p.isEliminated ? 'line-through text-red-500 font-medium' : p.id === activePlayer.id ? 'text-[#c5a059] font-bold underline' : ''}`}>
                        {p.name} {p.isEliminated && "💀"}
                      </span>
                    </span>
                    <span className="font-extrabold text-white">
                      {p.isEliminated 
                        ? (language === "fr" ? "Éliminé 💀" : "Eliminated 💀") 
                        : (gameMode === "points" 
                          ? `${p.score} pts` 
                          : `${p.refusals}/${maxRefusals} ` + (language === "fr" ? "refus" : "refusals"))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Logs panel */}
            <div className="md:col-span-2 glass-panel rounded-2xl p-4 space-y-3">
              <span className="text-xs font-semibold uppercase font-mono tracking-widest text-[#c5a059] block border-b border-zinc-900 pb-2">
                💬 {t.logHeader}
              </span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                {logs.slice(0, 8).map((log, index) => (
                  <p key={index} className="text-[11px] text-zinc-400 leading-relaxed truncate">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Quit button */}
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors border border-zinc-800/40 px-3 py-1.5 rounded-lg hover:border-zinc-700"
            >
              <Undo2 className="w-3.5 h-3.5" /> {t.quitBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
