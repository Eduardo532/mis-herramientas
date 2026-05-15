import { Peer, DataConnection } from 'peerjs';
import { GameState, RoomConfig, ActionPayload, AppUpdate, NetworkMessage } from '../types/poker';

// --- Configuración de Red ---
const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  }
};

class PeerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConn: DataConnection | null = null;
  private subscribers: ((update: AppUpdate) => void)[] = [];

  private isHost = false;
  private myId = '';
  private roomId = '';
  private cfg: RoomConfig = { stack: 10000, sb: 50, bb: 100 };
  private game: GameState = {
    phase: 'WAITING',
    pot: 0,
    bet: 0,
    dIdx: -1,
    tIdx: -1,
    players: []
  };

  // --- Utilidades ---

  private generateShortId(): string {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  private toRoomPeerId(roomCode: string): string {
    const normalized = roomCode.trim().toUpperCase();
    return normalized.startsWith('POKER-') ? `poker-${normalized.slice(6)}` : `poker-${normalized}`;
  }

  // --- Inicialización y Suscripción ---

  async initLocalPeer(): Promise<string> {
    if (this.peer && !this.peer.destroyed && this.myId) {
      return this.myId;
    }

    return new Promise((resolve, reject) => {
      this.peer = new Peer(PEER_CONFIG);
      
      this.peer.on('open', (id) => {
        this.myId = id;
        resolve(id);
      });

      this.peer.on('error', (err: any) => {
        if (err.type === 'unavailable-id') {
          window.location.reload();
          return;
        }

        if (err.type === 'peer-unavailable' && !this.isHost) {
          alert('No se pudo encontrar esa sala. Revisa el código y que el host siga conectado.');
          return;
        }

        reject(err);
      });
    });
  }

  subscribe(callback: (update: AppUpdate) => void) {
    this.subscribers.push(callback);
    return () => { 
      this.subscribers = this.subscribers.filter(s => s !== callback); 
    };
  }

  private emit(update: AppUpdate) {
    const freshUpdate = {
      ...update,
      game: update.game ? { ...update.game, players: [...update.game.players] } : undefined
    };
    this.subscribers.forEach(s => s(freshUpdate));
  }

  // --- Lógica de Host (Servidor) ---

  async createRoom(nick: string, config: RoomConfig) {
    this.isHost = true;
    this.cfg = config;
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    this.hostConn = null;
    this.game = {
      phase: 'WAITING',
      pot: 0,
      bet: 0,
      dIdx: -1,
      tIdx: -1,
      players: []
    };
    
    const shortId = this.generateShortId();
    const peerId = this.toRoomPeerId(shortId);
    
    if (this.peer) {
      this.peer.destroy();
    }
    
    setTimeout(() => {
      this.peer = new Peer(peerId, PEER_CONFIG);

      this.peer.on('open', (id) => {
        this.myId = id;
        this.roomId = shortId;
        
        this.game.players = []; 
        this.addPlayer(id, nick);

        this.peer?.on('connection', (conn) => {
          conn.on('data', (data: any) => this.handleNetworkData(conn, data));
          conn.on('close', () => this.handleDisconnect(conn.peer));
          conn.on('error', () => this.handleDisconnect(conn.peer));
        });

        this.emit({ 
          view: 'GAME', 
          roomId: this.roomId, 
          game: this.game, 
          cfg: this.cfg, 
          myId: this.myId 
        });
      });

      this.peer.on('error', (err: any) => {
        if (err.type === 'unavailable-id') {
          this.createRoom(nick, config);
          return;
        }
        alert('No se pudo crear la sala. Intenta nuevamente.');
      });
    }, 200);
  }

  private sync() {
    if (!this.isHost) return;
    
    const msg: NetworkMessage = { 
      type: 'SYNC', 
      game: JSON.parse(JSON.stringify(this.game)), 
      cfg: { ...this.cfg } 
    };
    
    this.connections.forEach(conn => {
      if (conn && conn.open) {
        conn.send(msg);
      }
    });
    
    this.emit({ game: this.game, cfg: this.cfg, myId: this.myId });
  }

  hostStartHand() {
    if (this.game.players.length < 2) return;
    this.game.phase = 'PREFLOP';
    this.game.pot = 0;
    this.game.bet = this.cfg.bb;
    this.game.dIdx = (this.game.dIdx + 1) % this.game.players.length;
    
    this.game.players.forEach(p => {
      p.bRound = 0;
      p.status = p.chips > 0 ? 'ACTIVE' : 'OUT';
      p.acted = false;
    });

    const L = this.game.players.length;
    this.forceBet((this.game.dIdx + 1) % L, this.cfg.sb);
    this.forceBet((this.game.dIdx + 2) % L, this.cfg.bb);
    this.game.tIdx = (this.game.dIdx + 3) % L;
    this.ensureValidTurn();
    this.sync();
  }

  private forceBet(idx: number, amt: number) {
    const p = this.game.players[idx];
    if (!p || p.status !== 'ACTIVE') return;
    const actual = Math.min(p.chips, amt);
    p.chips -= actual;
    p.bRound += actual;
    if (p.chips === 0) p.status = 'ALLIN';
  }

  hostAwardWinner(pid: string) {
    const p = this.game.players.find(x => x.id === pid);
    if (p) {
      p.chips += this.game.pot;
      this.game.pot = 0;
      this.game.phase = 'WAITING';
      this.sync();
    }
  }

  hostForceEnd() {
    this.game.players.forEach(p => {
      p.chips += p.bRound;
      p.bRound = 0;
    });
    this.game.pot = 0;
    this.game.phase = 'WAITING';
    this.sync();
  }

  hostKickPlayer(pid: string) {
    this.game.players = this.game.players.filter(p => p.id !== pid);
    this.connections.get(pid)?.close();
    this.connections.delete(pid);
    this.sync();
  }

  // --- Lógica de Cliente (Jugador) ---

  joinRoom(nick: string, rid: string) {
    if (!this.peer || this.peer.destroyed || !this.myId) {
      alert('La conexión todavía no está lista. Intenta unirte nuevamente en unos segundos.');
      return;
    }

    this.isHost = false;
    this.roomId = rid.trim().toUpperCase();
    this.hostConn = this.peer.connect(this.toRoomPeerId(this.roomId), { reliable: true });
    
    this.hostConn.on('open', () => {
      this.hostConn?.send({ type: 'JOIN', name: nick });
    });

    this.hostConn.on('data', (data: any) => {
      const msg = data as NetworkMessage;
      if (msg.type === 'SYNC') {
        this.game = msg.game;
        this.cfg = msg.cfg;
        this.emit({ view: 'GAME', roomId: this.roomId, game: this.game, cfg: this.cfg, myId: this.myId });
      }
    });

    this.hostConn.on('error', () => {
      alert('No se pudo conectar con la sala. Revisa que el código sea correcto y que el host mantenga la página abierta.');
    });

    this.hostConn.on('close', () => {
      alert("Conexión con la mesa perdida.");
      window.location.reload();
    });
  }

  sendAction(action: ActionPayload) {
    if (this.isHost) {
      this.processAction(this.myId, action);
    } else {
      this.hostConn?.send({ type: 'ACTION', action });
    }
  }

  // --- Motor de Reglas ---

  private handleNetworkData(conn: DataConnection, data: any) {
    const msg = data as NetworkMessage;
    if (msg.type === 'JOIN') {
      const pid = conn.peer;
      this.connections.set(pid, conn);
      this.addPlayer(pid, msg.name);
      
      setTimeout(() => this.sync(), 500);
      
    } else if (msg.type === 'ACTION') {
      this.processAction(conn.peer, msg.action);
    }
  }

  private addPlayer(id: string, name: string) {
    const existing = this.game.players.find(p => p.id === id);
    if (existing) {
      existing.active = true;
      existing.name = name;
    } else {
      this.game.players.push({
        id, 
        name, 
        chips: this.cfg.stack, 
        bRound: 0, 
        status: 'ACTIVE', 
        active: true, 
        acted: false
      });
    }
  }

  private handleDisconnect(pid: string) {
    const p = this.game.players.find(x => x.id === pid);
    if (p) p.active = false;
    this.sync();
  }

  private processAction(pid: string, act: ActionPayload) {
    const pIdx = this.game.players.findIndex(x => x.id === pid);
    const p = this.game.players[pIdx];
    if (!p || this.game.tIdx !== pIdx) return;

    p.acted = true;
    if (act.t === 'FOLD') p.status = 'FOLDED';
    if (act.t === 'CALL') {
      const diff = this.game.bet - p.bRound;
      const take = Math.min(p.chips, diff);
      p.chips -= take; 
      p.bRound += take;
      if (p.chips === 0) p.status = 'ALLIN';
    }
    if (act.t === 'RAISE') {
      const add = act.v - p.bRound;
      if (p.chips >= add && act.v > this.game.bet) {
        p.chips -= add; 
        p.bRound = act.v; 
        this.game.bet = act.v;
        this.game.players.forEach(x => { 
          if (x !== p && x.status === 'ACTIVE') x.acted = false; 
        });
      }
    }
    this.advanceTurn();
    this.sync();
  }

  private advanceTurn() {
    const actives = this.game.players.filter(p => p.status === 'ACTIVE');
    const waiting = actives.filter(p => !p.acted || p.bRound < this.game.bet);
    
    const notFolded = this.game.players.filter(p => p.status !== 'FOLDED' && p.status !== 'OUT');

    if (notFolded.length === 1 || (actives.length === 0 && waiting.length === 0)) {
      this.collectPot();
      this.game.phase = 'SHOWDOWN';
      return;
    }

    if (waiting.length === 0) {
      this.collectPot();
      const phases: GameState['phase'][] = ['PREFLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN'];
      const nextIdx = phases.indexOf(this.game.phase) + 1;
      this.game.phase = phases[nextIdx];
      
      if (this.game.phase !== 'SHOWDOWN') {
        this.game.bet = 0;
        this.game.players.forEach(p => p.acted = false);
        this.game.tIdx = (this.game.dIdx + 1) % this.game.players.length;
        this.ensureValidTurn();
      }
    } else {
      this.game.tIdx = (this.game.tIdx + 1) % this.game.players.length;
      this.ensureValidTurn();
    }
  }

  private ensureValidTurn() {
    let count = 0;
    while (this.game.players[this.game.tIdx]?.status !== 'ACTIVE' && count < 15) {
      this.game.tIdx = (this.game.tIdx + 1) % this.game.players.length;
      count++;
    }
  }

  private collectPot() {
    this.game.players.forEach(p => { 
      this.game.pot += p.bRound; 
      p.bRound = 0; 
    });
  }
}

export const peerService = new PeerService();
