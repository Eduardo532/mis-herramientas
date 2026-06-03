export type PlayerStatus = 'ACTIVE' | 'FOLDED' | 'ALLIN' | 'OUT';

export type GamePhase = 'WAITING' | 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

export interface Player {
  id: string;
  name: string;
  chips: number;
  bRound: number;
  status: PlayerStatus;
  active: boolean;
  acted: boolean;
}

export interface GameState {
  phase: GamePhase;
  pot: number;
  bet: number;
  dIdx: number;
  tIdx: number;
  players: Player[];
}

export interface RoomConfig {
  stack: number;
  sb: number;
  bb: number;
}

export interface ActionPayload {
  t: 'FOLD' | 'CALL' | 'RAISE';
  v: number;
}

export interface AppUpdate {
  game?: GameState;
  cfg?: RoomConfig;
  roomId?: string;
  myId?: string;
  view?: 'LOBBY' | 'GAME';
}

// --- Mensajes de Red ---
export type NetworkMessage = 
  | { type: 'JOIN'; name: string }
  | { type: 'SYNC'; game: GameState; cfg: RoomConfig }
  | { type: 'ACTION'; action: ActionPayload }
  | { type: 'REQUEST_SYNC' };
