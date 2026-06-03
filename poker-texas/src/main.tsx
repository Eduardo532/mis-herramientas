import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Importaciones de tipos, servicios y componentes (se crearán en los siguientes pasos)
import { GameState, RoomConfig } from './types/poker';
import { peerService } from './services/peerService';
import { Lobby } from './components/Lobby';
import { TableZone } from './components/TableZone';
import { PlayerRing } from './components/PlayerRing';
import { HeroPanel } from './components/HeroPanel';

function PokerApp() {
  // --- Estados Globales de la Interfaz ---
  const [view, setView] = useState<'LOBBY' | 'GAME'>('LOBBY');
  const [roomId, setRoomId] = useState<string>('');
  const [myId, setMyId] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  
  // --- Estados del Juego (Sincronizados por WebRTC) ---
  const [cfg, setCfg] = useState<RoomConfig>({ stack: 10000, sb: 50, bb: 100 });
  const [game, setGameState] = useState<GameState>({
    phase: 'WAITING',
    pot: 0,
    bet: 0,
    dIdx: -1,
    tIdx: -1,
    players: []
  });

  // --- Efecto de Inicialización y Suscripción P2P ---
  useEffect(() => {
    let cancelled = false;

    const unsubscribe = peerService.subscribe((newState) => {
      // Actualizamos cada pieza de estado solo si viene en el mensaje
      if (newState.game) setGameState({ ...newState.game }); // Forzamos re-render
      if (newState.cfg) setCfg({ ...newState.cfg });
      if (newState.roomId) setRoomId(newState.roomId);
      if (newState.view) setView(newState.view);
      if (newState.myId) setMyId(newState.myId);
    });

    peerService.initLocalPeer().then((id) => {
      if (!cancelled) setMyId(id);
    }).catch(() => {
      if (!cancelled) alert('No se pudo iniciar la conexión P2P. Recarga la página e intenta nuevamente.');
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // --- Controladores de Acción del Usuario ---
  const handleCreateRoom = (nick: string, config: RoomConfig) => {
    setIsHost(true);
    setCfg(config);
    peerService.createRoom(nick, config);
  };

  const handleJoinRoom = (nick: string, roomToJoin: string) => {
    setIsHost(false);
    peerService.joinRoom(nick, roomToJoin);
  };

  const handleAction = (type: 'FOLD' | 'CALL' | 'RAISE', val?: number) => {
    peerService.sendAction({ t: type, v: val || 0 });
  };

  // --- Controladores de Administración (Exclusivos del Host) ---
  const hostActions = {
    startHand: () => peerService.hostStartHand(),
    forceEnd: () => peerService.hostForceEnd(),
    awardWinner: (playerId: string) => peerService.hostAwardWinner(playerId),
    kickPlayer: (playerId: string) => peerService.hostKickPlayer(playerId)
  };

  return (
    <React.StrictMode>
      {view === 'LOBBY' ? (
        <Lobby 
          myId={myId} 
          onCreateRoom={handleCreateRoom} 
          onJoinRoom={handleJoinRoom} 
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
          
          {/* --- Barra Superior: Indicador Visual de Ronda --- */}
          <div style={{ 
            background: 'rgba(0,0,0,0.4)', 
            padding: '8px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '6px', 
            flexWrap: 'wrap', 
            zIndex: 100 
          }}>
            {(['PREFLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN'] as const).map((ph) => (
              <span 
                key={ph} 
                style={{
                  fontSize: '0.7rem',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  opacity: game.phase === ph ? 1 : 0.3,
                  background: game.phase === ph ? '#38bdf8' : 'transparent',
                  color: game.phase === ph ? '#0f172a' : '#f8fafc',
                  boxShadow: game.phase === ph ? '0 0 10px #38bdf8' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {ph === 'SHOWDOWN' ? 'PAGOS' : ph}
              </span>
            ))}
          </div>

          {/* --- Zona Central: Tapete y Anillo Elíptico de Jugadores --- */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <TableZone 
              pot={game.pot} 
              phase={game.phase} 
              isHost={isHost} 
              players={game.players} 
              hostActions={hostActions} 
            />
            <PlayerRing 
              players={game.players} 
              tIdx={game.tIdx} 
              dIdx={game.dIdx} 
              myId={myId} 
              isHost={isHost} 
              onKick={hostActions.kickPlayer} 
            />
          </div>

          {/* --- Panel Inferior Fijo: Controles Responsivos (Hero) --- */}
          <HeroPanel 
            game={game} 
            myId={myId} 
            roomId={roomId} 
            bb={cfg.bb} 
            onAction={handleAction} 
          />

        </div>
      )}
    </React.StrictMode>
  );
}

// Inicialización del árbol de React en el DOM
ReactDOM.createRoot(document.getElementById('root')!).render(<PokerApp />);
