import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Card, Room, Player, GameStatus } from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not set. AI Dare Generation will fall back to local database templates.");
}

// In-Memory Databases
const rooms: Map<string, Room> = new Map();

// Standard Card Templates (French & English support, defaults to French)
const LOCAL_DECKS: Record<string, { fr: string[]; en: string[] }> = {
  Soft: {
    fr: [
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
    ],
    en: [
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
    ]
  },
  Fun: {
    fr: [
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
    ],
    en: [
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
    ]
  },
  Hard: {
    fr: [
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
    ],
    en: [
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
    ]
  },
  Caliente: {
    fr: [
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
    ],
    en: [
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
    ]
  },
  Honte: {
    fr: [
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
    ],
    en: [
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
  }
};

// Generate random uppercase letter room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// AI generation handler
app.post("/api/gemini/generate", async (req, res) => {
  const { category, count = 5, customTheme = "", language = "fr" } = req.body;

  if (!ai) {
    // If Gemini is not initialized, fallback to picking randomly from our LOCAL_DECKS
    console.log("No Gemini API key available. Falling back to predefined list.");
    const collection = LOCAL_DECKS[category]?.[language as "fr" | "en"] || LOCAL_DECKS.Soft[language as "fr" | "en"];
    const shuffled = shuffleArray(collection);
    const results = shuffled.slice(0, count).map(txt => ({ text: txt }));
    return res.json({ success: true, dares: results, fallback: true });
  }

  try {
    const prompt = `Génère ${count} défis "Cap ou Pas Cap" originaux, drôles, hilarants et sécurisés pour la catégorie "${category}".
Le jeu est joué par de jeunes adultes.
${customTheme ? `Le thème spécial de la soirée est : "${customTheme}". Intègre ce thème dans certains défis.` : ""}
Chaque défi doit être une phrase d'action claire rédigée à la deuxième personne du singulier commençant obligatoirement par : "Cap de..." ou "Cap d'..." (ou "Dare to..." en anglais si la langue est "${language}").
Reste extrêmement drôle, dynamique et idéal pour s'amuser en ligne ou en soirée.
Langue demandée : ${language === "fr" ? "Français" : "English"}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dares: {
              type: Type.ARRAY,
              description: "La liste des défis générés",
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Le texte complet du défi" }
                },
                required: ["text"]
              }
            }
          },
          required: ["dares"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    if (data.dares && Array.isArray(data.dares)) {
      return res.json({ success: true, dares: data.dares });
    } else {
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // Fallback gracefully to LOCAL_DECKS
    const collection = LOCAL_DECKS[category]?.[language as "fr" | "en"] || LOCAL_DECKS.Soft[language as "fr" | "en"];
    const shuffled = shuffleArray(collection);
    const results = shuffled.slice(0, count).map(txt => ({ text: txt }));
    return res.json({ success: true, dares: results, error: error.message, fallback: true });
  }
});

// Create Room Endpoint
app.post("/api/rooms/create", (req, res) => {
  const { hostName, decks = ["Soft", "Fun"], allowAnonymous = true, maxRefusals = 3, targetScore = 15, gameMode = 'PARTY' } = req.body;

  if (!hostName || typeof hostName !== "string") {
    return res.status(400).json({ error: "Host name is required" });
  }

  const code = generateRoomCode();
  const hostId = "p_" + Math.random().toString(36).substr(2, 9);

  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
    score: 0,
    isHost: true,
    active: true,
    refusals: 0,
    currentVote: null
  };

  const room: Room = {
    code,
    hostId,
    players: [hostPlayer],
    status: "LOBBY",
    gameMode,
    decks,
    customCards: [],
    fullDeck: [],
    currentCardIndex: -1,
    currentCard: null,
    turnPlayerId: hostId,
    logs: [`Le salon ${code} a été créé par ${hostName}.`],
    allowAnonymous,
    maxRefusals,
    targetScore
  };

  rooms.set(code, room);
  res.json({ success: true, roomCode: code, playerId: hostId, room });
});

// Join Room Endpoint
app.post("/api/rooms/join", (req, res) => {
  const { roomCode, playerName } = req.body;

  if (!roomCode || !playerName) {
    return res.status(400).json({ error: "Room code and player name are required" });
  }

  const code = roomCode.toUpperCase().trim();
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (room.status !== "LOBBY") {
    return res.status(400).json({ error: "La partie a déjà commencé dans ce salon !" });
  }

  // Check name duplication
  const nameExists = room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase());
  const finalName = nameExists ? `${playerName} (${room.players.length + 1})` : playerName;

  const playerId = "p_" + Math.random().toString(36).substr(2, 9);
  const newPlayer: Player = {
    id: playerId,
    name: finalName,
    score: 0,
    isHost: false,
    active: true,
    refusals: 0,
    currentVote: null
  };

  room.players.push(newPlayer);
  room.logs.push(`${finalName} a rejoint le salon.`);

  res.json({ success: true, roomCode: code, playerId, room });
});

// Add Custom Card Endpoint
app.post("/api/rooms/add-custom", (req, res) => {
  const { roomCode, playerId, cardText, anonymous = true } = req.body;

  if (!roomCode || !cardText) {
    return res.status(400).json({ error: "Room code and card text are required" });
  }

  const code = roomCode.toUpperCase().trim();
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const player = room.players.find(p => p.id === playerId);
  const creatorName = anonymous ? "Anonyme" : (player?.name || "Inconnu");

  const newCard: Card = {
    id: "card_" + Math.random().toString(36).substr(2, 9),
    text: cardText,
    category: "Supreme",
    creator: creatorName
  };

  room.customCards.push(newCard);
  room.logs.push(`Un nouveau défi custom secret a été ajouté au deck ${anonymous ? 'anonymement' : `par ${player?.name || 'Inconnu'}`}.`);

  res.json({ success: true, count: room.customCards.length });
});

// Start Game Endpoint
app.post("/api/rooms/start", (req, res) => {
  const { roomCode, playerId, language = "fr", decks, maxRefusals, targetScore } = req.body;

  const code = roomCode.toUpperCase().trim();
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (room.hostId !== playerId) {
    return res.status(403).json({ error: "Only the host can start the game" });
  }

  if (room.players.length < 1) {
    return res.status(400).json({ error: "Il faut au moins 1 joueur pour lancer !" });
  }

  // Update configuration parameters if supplied
  if (decks && Array.isArray(decks)) {
    room.decks = decks;
  }
  if (typeof maxRefusals === "number") {
    room.maxRefusals = maxRefusals;
  }
  if (typeof targetScore === "number") {
    room.targetScore = targetScore;
  }

  // Compile deck
  let assembledDeck: Card[] = [];

  // Add chosen official templates
  room.decks.forEach(deckName => {
    const list = LOCAL_DECKS[deckName]?.[language as "fr" | "en"] || [];
    list.forEach((txt, idx) => {
      assembledDeck.push({
        id: `card_${deckName}_${idx}`,
        text: txt,
        category: deckName as any
      });
    });
  });

  // Add custom cards
  room.customCards.forEach(c => {
    assembledDeck.push(c);
  });

  // Shuffle card deck
  room.fullDeck = shuffleArray(assembledDeck);
  room.currentCardIndex = 0;
  room.currentCard = room.fullDeck[0] || {
    id: "card_fallback",
    text: language === "fr" ? "Cap de chanter une berceuse !" : "Dare to sing a lullaby!",
    category: "Soft"
  };

  // Determine first turn player
  const activePlayers = room.players.filter(p => p.active);
  if (activePlayers.length > 0) {
    // Pick first player
    room.players.forEach(p => p.active = false);
    activePlayers[0].active = true;
    room.turnPlayerId = activePlayers[0].id;
  }

  room.status = "PLAYING";
  room.logs.push("La partie commence ! C'est au tour de " + (room.players.find(p => p.id === room.turnPlayerId)?.name || "") + " de choisir.");

  res.json({ success: true, room });
});

// Helper: Set Supreme card
function setSupremeCard(room: Room, player: Player, language: string) {
  const supremeCards = room.customCards;
  const supremeText = supremeCards.length > 0 
    ? supremeCards[Math.floor(Math.random() * supremeCards.length)].text 
    : (language === "fr" ? "DÉFI SUPRÊME : Fais quelque chose de vraiment gênant pour tout le monde !" : "SUPREME DARE: Do something truly embarrassing for everyone!");
  
  room.currentCard = {
    id: "card_supreme_" + Math.random().toString(36).substr(2, 9),
    text: supremeText,
    category: "Supreme",
  };
  room.status = "PLAYING";
  room.turnPlayerId = player.id;
  room.logs.push(`⚠️ ATTENTION ! ${player.name} a atteint le max de refus ! Il doit obligatoirement réaliser un DÉFI SUPRÊME !`);
  player.refusals = 0;
}

// Action Endpoint (Flip, Pass, Vote, Resolve)
app.post("/api/rooms/action", (req, res) => {
  const { roomCode, playerId, actionType, voteValue, outcome, language = "fr" } = req.body;

  const code = roomCode.toUpperCase().trim();
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const currentPlayer = room.players.find(p => p.id === playerId);
  if (!currentPlayer) {
    return res.status(404).json({ error: "Player not found in this room" });
  }

  const turnPlayer = room.players.find(p => p.id === room.turnPlayerId);

  switch (actionType) {
    case "FLIP":
      // Player says "CAP" and flips the card
      if (room.turnPlayerId !== playerId) {
        return res.status(403).json({ error: "It's not your turn!" });
      }
      if (room.status !== "PLAYING") {
        return res.status(400).json({ error: "Card already flipped or game not in correct state" });
      }
      room.status = "CARD_REVEALED";
      room.logs.push(`${currentPlayer.name} dit : "CAP !" et retourne la carte... 🫵`);
      break;

    case "PASS":
      // Player says "PAS CAP"
      if (room.turnPlayerId !== playerId) {
        return res.status(403).json({ error: "It's not your turn!" });
      }
      if (room.status !== "PLAYING") {
        return res.status(400).json({ error: "Cannot pass now." });
      }

      // Increment refusals
      currentPlayer.refusals += 1;
      const penalty = language === "fr" ? "une gorgée de pénalité" : "a penalty sip";
      room.logs.push(`${currentPlayer.name} dit : "PAS CAP..." 🙈 Il refuse le défi et prend ${penalty}. Refus : ${currentPlayer.refusals}/${room.maxRefusals}`);

      // Apply score penalty
      currentPlayer.score = Math.max(0, currentPlayer.score - 1);

      // Check trigger
      if (currentPlayer.refusals >= room.maxRefusals) {
        setSupremeCard(room, currentPlayer, language);
      } else {
        // Advance turn immediately after pass
        advanceToNextTurn(room, language);
      }
      break;

    case "VOTE":
      // Voters vote VALIDATED or CHEATED
      if (room.status !== "CARD_REVEALED" && room.status !== "VOTING") {
        return res.status(400).json({ error: "Not in voting phase" });
      }
      if (room.turnPlayerId === playerId) {
        return res.status(400).json({ error: "You cannot vote on your own dare!" });
      }

      room.status = "VOTING";
      currentPlayer.currentVote = voteValue; // 'VALIDATED' | 'CHEATED'
      room.logs.push(`${currentPlayer.name} a voté.`);

      // Check if everyone else voted
      const otherPlayersCount = room.players.length - 1;
      const votedCount = room.players.filter(p => p.id !== room.turnPlayerId && p.currentVote !== null).length;

      if (votedCount >= otherPlayersCount && otherPlayersCount > 0) {
        resolveTurnVotes(room, language);
      }
      break;

    case "IMPOSSIBLE":
      // Player says "PAS POSSIBLE" (missing material, etc.)
      if (room.turnPlayerId !== playerId) {
        return res.status(403).json({ error: "It's not your turn!" });
      }
      if (room.status !== "PLAYING") {
        return res.status(400).json({ error: "Cannot declare impossible now." });
      }

      // Increment refusals (treated as failure)
      currentPlayer.refusals += 1;
      const penaltyImpossible = language === "fr" ? "une gorgée de pénalité" : "a penalty sip";
      room.logs.push(`${currentPlayer.name} dit : "PAS POSSIBLE..." 🛠️ Ce n'était pas réalisable. Il prend ${penaltyImpossible}. Refus : ${currentPlayer.refusals}/${room.maxRefusals}`);

      // Apply score penalty
      currentPlayer.score = Math.max(0, currentPlayer.score - 1);

      // Check trigger
      if (currentPlayer.refusals >= room.maxRefusals) {
        setSupremeCard(room, currentPlayer, language);
      } else {
        // Advance turn immediately
        advanceToNextTurn(room, language);
      }
      break;

    case "FORCE_RESOLVE":
      // Host can force resolve if some players are unresponsive
      if (room.hostId !== playerId) {
        return res.status(403).json({ error: "Only the host can force resolve" });
      }
      resolveTurnVotes(room, language);
      break;

    case "NEXT_ROUND":
      // Host advances to next round
      if (room.hostId !== playerId) {
        return res.status(403).json({ error: "Only the host can advance to the next turn" });
      }
      advanceToNextTurn(room, language);
      break;

    case "RESTART":
      if (room.hostId !== playerId) {
        return res.status(403).json({ error: "Only the host can reset the game" });
      }
      room.players.forEach(p => {
        p.score = 0;
        p.refusals = 0;
        p.currentVote = null;
      });
      room.status = "LOBBY";
      room.logs.push("L'hôte a réinitialisé la partie. Retour au salon !");
      break;

    case "RESOLVE_SUPREME":
      if (room.status !== "CARD_REVEALED") {
        return res.status(400).json({ error: "Card not flipped yet" });
      }
      if (room.currentCard?.category !== "Supreme") {
        return res.status(400).json({ error: "Not a Supreme Card" });
      }
      if (room.turnPlayerId !== playerId && room.hostId !== playerId) {
        return res.status(403).json({ error: "Only the turn player or host can resolve the Supreme Dare" });
      }
      
      const isSuccess = outcome === "SUCCESS";
      if (isSuccess) {
        turnPlayer.refusals = 0;
        room.logs.push(`🎉 INCROYABLE ! ${turnPlayer.name} a réussi son DÉFI SUPRÊME et reste dans la partie !`);
        room.status = "ROUND_END";
      } else {
        turnPlayer.isEliminated = true;
        turnPlayer.active = false;
        room.logs.push(`💀 ${turnPlayer.name} a échoué au DÉFI SUPRÊME et est éliminé !`);
        
        const activePlayers = room.players.filter(p => !p.isEliminated);
        if (activePlayers.length <= 1) {
          room.status = "FINISHED";
          if (activePlayers.length === 1) {
            room.logs.push(`🏆 VICTOIRE ! ${activePlayers[0].name} est le dernier survivant et remporte la partie !`);
          } else {
            room.logs.push(`💀 Tout le monde a été éliminé ! Personne ne gagne.`);
          }
        } else {
          room.status = "ROUND_END";
        }
      }
      break;

    default:
      return res.status(400).json({ error: "Invalid action" });
  }

  res.json({ success: true, room });
});

// Helper: Resolve votes and update scores
function resolveTurnVotes(room: Room, language: string) {
  const turnPlayer = room.players.find(p => p.id === room.turnPlayerId);
  if (!turnPlayer) return;

  const votes = room.players.filter(p => p.id !== room.turnPlayerId && p.currentVote !== null);
  const validatedCount = votes.filter(v => v.currentVote === "VALIDATED").length;
  const cheatedCount = votes.filter(v => v.currentVote === "CHEATED").length;

  let success = true;
  if (votes.length > 0) {
    success = validatedCount >= cheatedCount;
  }

  if (success) {
    const pointsAwarded = room.currentCard?.category === "Hard" || room.currentCard?.category === "Honte" ? 3 : room.currentCard?.category === "Caliente" ? 2 : 1;
    turnPlayer.score += pointsAwarded;
    // Reset consecutive refusals on successful challenge
    turnPlayer.refusals = 0;
    room.logs.push(`Défi validé ! 🎉 ${turnPlayer.name} gagne ${pointsAwarded} point(s) ! Score total : ${turnPlayer.score}`);

    // Check for target score victory
    const limit = room.targetScore || 15;
    if (turnPlayer.score >= limit) {
      room.status = "FINISHED";
      room.logs.push(`🏆 VICTOIRE ! ${turnPlayer.name} a atteint ${turnPlayer.score} points et remporte la partie ! Félicitations !`);
      return;
    }
  } else {
    turnPlayer.refusals += 1;
    if (room.gameMode === 'SUDDEN_DEATH' && room.currentCard?.category === 'Supreme') {
      turnPlayer.isEliminated = true;
      turnPlayer.active = false;
      room.logs.push(`${turnPlayer.name} a échoué au DÉFI SUPRÊME et est éliminé ! 💀`);
      
      const activePlayers = room.players.filter(p => !p.isEliminated);
      if (activePlayers.length <= 1) {
        room.status = "FINISHED";
        if (activePlayers.length === 1) {
          room.logs.push(`🏆 VICTOIRE ! ${activePlayers[0].name} est le dernier survivant et remporte la partie !`);
        } else {
          room.logs.push(`💀 Tout le monde a été éliminé ! Personne ne gagne.`);
        }
        return;
      }
    } else {
      room.logs.push(`Tricheur ou raté ! ❌ Le défi de ${turnPlayer.name} a été rejeté par la majorité. Pas de points. Refus : ${turnPlayer.refusals}/${room.maxRefusals}`);
    }
  }

  // If player reached maximum refusals on a non-Supreme card and is not eliminated, immediately trigger Supreme Dare!
  if (room.currentCard?.category !== 'Supreme' && turnPlayer.refusals >= room.maxRefusals && !turnPlayer.isEliminated) {
    setSupremeCard(room, turnPlayer, language);
  } else {
    room.status = "ROUND_END";
  }
}

// Helper: Advance turn
function advanceToNextTurn(room: Room, language: string) {
  // Reset player votes
  room.players.forEach(p => {
    p.currentVote = null;
    p.active = false;
  });

  // Find next player
  const currentIndex = room.players.findIndex(p => p.id === room.turnPlayerId);
  let nextIndex = (currentIndex + 1) % room.players.length;
  let nextPlayer = room.players[nextIndex];
  
  // Skip eliminated players
  while (nextPlayer.isEliminated) {
    nextIndex = (nextIndex + 1) % room.players.length;
    nextPlayer = room.players[nextIndex];
  }
  
  room.turnPlayerId = nextPlayer.id;
  nextPlayer.active = true;

  // Sudden Death Win Check
  if (room.gameMode === 'SUDDEN_DEATH') {
    const activePlayers = room.players.filter(p => !p.isEliminated);
    if (activePlayers.length === 1) {
      room.status = "FINISHED";
      room.logs.push(`🏆 VICTOIRE ! ${activePlayers[0].name} est le dernier survivant !`);
      return;
    }
  }

  // Move to next card
  room.currentCardIndex += 1;

  if (room.currentCardIndex >= room.fullDeck.length) {
    // Re-shuffle deck if we ran out of cards
    room.fullDeck = shuffleArray(room.fullDeck);
    room.currentCardIndex = 0;
    room.currentCard = room.fullDeck[0] || null;
    room.logs.push("Toutes les cartes ont été piochées ! Re-mélange du deck...");
  } else {
    room.currentCard = room.fullDeck[room.currentCardIndex] || null;
  }

  room.status = "PLAYING";
  room.logs.push(`Nouveau tour : c'est au tour de ${nextPlayer.name} !`);
}

// Get Room State Endpoint (polling)
app.get("/api/rooms/state/:code", (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({ success: true, room });
});

// Leave Room Endpoint
app.post("/api/rooms/leave", (req, res) => {
  const { roomCode, playerId } = req.body;

  const code = roomCode?.toUpperCase().trim();
  const room = rooms.get(code);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  const index = room.players.findIndex(p => p.id === playerId);
  if (index !== -1) {
    const p = room.players[index];
    room.players.splice(index, 1);
    room.logs.push(`${p.name} a quitté la partie.`);

    // If host leaves, designate new host or delete room
    if (p.isHost && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].id;
      room.logs.push(`${room.players[0].name} est le nouvel hôte.`);
    } else if (room.players.length === 0) {
      rooms.delete(code);
    }

    // If active player left, advance turn
    if (room.turnPlayerId === playerId && room.players.length > 0) {
      advanceToNextTurn(room, "fr");
    }
  }

  res.json({ success: true });
});

// Vite middleware / asset routing setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
