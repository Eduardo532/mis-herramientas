/**
 * Estados posibles de un jugador durante la mano.
 */
export type PlayerStatus = 'ACTIVE' | 'FOLDED' | 'ALLIN' | 'OUT';

/**
 * Fases cronológicas del juego Texas Hold'em.
 */
export type GamePhase = 'WAITING' | 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

/**
 * Representación estricta de un jugador en la mesa.
 */
export interface Player {
  id: string;         // ID único de PeerJS (persistente)
  name: string;       // Apodo del jugador
  chips: number;      // Stack actual de fichas
  bRound: number;     // Apuesta acumulada en la ronda actual
  status: PlayerStatus;
  active: boolean;    // Indica si el socket/peer está conectado actualmente
  acted: boolean;     // Indica si ya tomó una decisión en la ronda actual
}

/**
 * Estado maestro del juego que se sincroniza por la red.
 */
export interface GameState {
  phase: GamePhase;
  pot: number;        // Pozo total acumulado en el centro
  bet: number;        // La apuesta más alta a igualar en la ronda
  dIdx: number;       // Índice del Dealer (D)
  tIdx: number;       // Índice del jugador que tiene el turno actual
  players: Player[];
}

/**
 * Configuración inicial de la sala definida por el Host.
 */
export interface RoomConfig {
  stack: number;      // Fichas iniciales
  sb: number;         // Ciega Pequeña (Small Blind)
  bb: number;         // Ciega Grande (Big Blind)
}

/**
 * Payload para las acciones que los clientes envían al Host.
 */
export interface ActionPayload {
  t: 'FOLD' | 'CALL' | 'RAISE';
  v: number;          // Valor numérico (solo relevante para RAISE)
}

/**
 * Interfaz para el sistema de suscripción reactiva en main.tsx.
 */
export interface AppUpdate {
  game?: GameState;
  cfg?: RoomConfig;
  roomId?: string;
  myId?: string; // <--- Añade esta línea
  view?: 'LOBBY' | 'GAME';
}

/**
 * Tipo para los mensajes de red entre nodos.
 */
export type NetworkMessage = 
  | { type: 'JOIN'; name: string }
  | { type: 'SYNC'; game: GameState; cfg: RoomConfig }
  | { type: 'ACTION'; action: ActionPayload };