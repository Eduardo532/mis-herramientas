import React from 'react';
import { Player, GamePhase } from '../types/poker';

interface TableZoneProps {
  pot: number;
  phase: GamePhase;
  isHost: boolean;
  players: Player[];
  hostActions: {
    startHand: () => void;
    forceEnd: () => void;
    awardWinner: (pid: string) => void;
  };
}

export function TableZone({ pot, phase, isHost, players, hostActions }: TableZoneProps) {
  // Filtramos jugadores que no se han retirado para mostrar los botones de ganador
  const activePlayers = players.filter(p => p.status !== 'FOLDED' && p.status !== 'OUT');

  return (
    <div style={containerStyle}>
      {/* Mesa de Poker (Felt) */}
      <div style={feltStyle}>
        
        {/* Visualización del Pozo */}
        <div style={{ 
          textAlign: 'center', 
          opacity: phase === 'WAITING' ? 0.2 : 1,
          transition: 'opacity 0.5s ease'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 800 }}>
            Pozo Total
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {pot.toLocaleString()}
          </div>
        </div>

        {/* Consola de Administración (Solo Host) */}
        {isHost && (
          <div style={hostConsoleStyle}>
            {phase === 'WAITING' && (
              <button onClick={hostActions.startHand} style={adminBtnStyle}>
                INICIAR MANO
              </button>
            )}

            {phase === 'SHOWDOWN' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fbbf24' }}>ELEGIR GANADOR:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
                  {activePlayers.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => hostActions.awardWinner(p.id)}
                      style={{ ...adminBtnStyle, background: '#10b981', fontSize: '0.7rem', padding: '6px 12px' }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase !== 'WAITING' && (
              <button 
                onClick={hostActions.forceEnd} 
                style={{ ...adminBtnStyle, background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', marginTop: '10px' }}
              >
                CANCELAR MANO
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Estilos ---
const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 1
};

const feltStyle: React.CSSProperties = {
  width: '90%',
  maxWidth: '550px',
  aspectRatio: '1.8 / 1',
  background: '#065f46',
  border: '8px solid #047857',
  borderRadius: '1000px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6), 0 15px 40px rgba(0,0,0,0.4)',
};

const hostConsoleStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 10
};

const adminBtnStyle: React.CSSProperties = {
  background: '#38bdf8',
  color: '#0f172a',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '10px',
  fontWeight: 900,
  fontSize: '0.8rem',
  cursor: 'pointer',
  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  textTransform: 'uppercase'
};