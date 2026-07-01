export interface Card {
  id: string;
  text: string;
  category: 'Soft' | 'Fun' | 'Hard' | 'Caliente' | 'Supreme' | 'Honte';
  creator?: string;
  isHonte?: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  active: boolean;
  refusals: number;
  currentVote: 'VALIDATED' | 'CHEATED' | null;
  isEliminated?: boolean; // Add this
}

export type GameStatus = 'LOBBY' | 'PLAYING' | 'CARD_REVEALED' | 'VOTING' | 'ROUND_END' | 'FINISHED';

export type GameMode = 'PARTY' | 'SUDDEN_DEATH'; // Add this

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  status: GameStatus;
  gameMode: GameMode; // Add this
  decks: string[]; // ['Soft', 'Fun', 'Hard', 'Caliente']
  customCards: Card[];
  fullDeck: Card[];
  currentCardIndex: number;
  currentCard: Card | null;
  turnPlayerId: string | null;
  logs: string[];
  allowAnonymous: boolean;
  maxRefusals: number; // default 3, then triggers a Honte card
  targetScore?: number; // target points to win the game
}
