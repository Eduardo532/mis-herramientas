import React, { useState } from 'react';
import { GameState } from '../types/poker';

interface HeroPanelProps {
  game: GameState;
  myId: string;
  roomId: string;
  bb: number;
  onAction: (type: 'FOLD' | 'CALL' | 'RAISE', val?: number) => void;
}

export function HeroPanel({ game, myId, roomId, bb, onAction }: HeroPanelProps) {
  const me = game.players.find(p => p.id === myId);
  const [raiseVal, setRaiseVal] = useState(game.bet + bb);

  if (!me) return null;

  const isMyTurn = game.tIdx !== -1 && game.players[game.tIdx]?.id === myId;
  const canPlay = isMyTurn && me.status === 'ACTIVE' && game.phase !== 'SHOWDOWN' && game.phase !== 'WAITING';
  
  const callAmount = game.bet - me.bRound;
  const isCheck = callAmount <= 0;

  return (
    <div style={heroContainerStyle}>
      <div style={topRowStyle}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>SALA #{roomId}</div>
          <div style={{ fontSize: '1rem', fontWeight: 900, color: 'white' }}>{me.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 800 }}>TU STACK</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8' }}>{me.chips.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {canPlay ? (
          <div style={{ width: '100%' }}>
            <div style={actionRowStyle}>
              <button 
                onClick={() => onAction('FOLD')} 
                style={{ ...btnBase, background: '#ef4444', flex: 1 }}
              >
                FOLD
              </button>
              <button 
                onClick={() => onAction('CALL')} 
                style={{ ...btnBase, background: '#38bdf8', color: '#0f172a', flex: 2 }}
              >
                {isCheck ? 'CHECK' : `CALL ${callAmount.toLocaleString()}`}
              </button>
            </div>

            <div style={{ ...actionRowStyle, marginTop: '10px' }}>
              {/* CORRECCIÓN DE ACCESIBILIDAD Y AUTOFILL */}
              <label htmlFor="raiseAmountInput" style={{ display: 'none' }}>Monto a subir</label>
              <input 
                id="raiseAmountInput"
                name="raiseAmountInput"
                type="number" 
                value={raiseVal} 
                step={bb}
                min={game.bet + bb}
                onChange={(e) => setRaiseVal(Number(e.target.value))}
                style={raiseInputStyle}
              />
              <button 
                onClick={() => onAction('RAISE', raiseVal)} 
                style={{ ...btnBase, background: '#10b981', flex: 1 }}
              >
                RAISE
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, fontStyle: 'italic' }}>
            {game.phase === 'WAITING' ? 'Esperando inicio...' : 'Esperando turno de oponente...'}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Estilos ---
const heroContainerStyle: React.CSSProperties = {
  background: '#1e293b',
  padding: '15px 20px',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  paddingBottom: 'max(15px, env(safe-area-inset-bottom))',
  zIndex: 20
};

const topRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px'
};

const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  width: '100%'
};

const btnBase: React.CSSProperties = {
  border: 'none',
  padding: '14px',
  borderRadius: '12px',
  fontWeight: 900,
  fontSize: '1rem',
  cursor: 'pointer',
  color: 'white'
};

const raiseInputStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid #334155',
  borderRadius: '12px',
  color: '#10b981',
  textAlign: 'center',
  fontSize: '1.2rem',
  fontWeight: 900,
  outline: 'none'
};