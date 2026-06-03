import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types/poker';

interface PlayerRingProps {
  players: Player[];
  tIdx: number;
  dIdx: number;
  myId: string;
  isHost: boolean;
  onKick: (pid: string) => void;
}

export function PlayerRing({ players, tIdx, dIdx, myId, isHost, onKick }: PlayerRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // Escuchar el tamaño de la zona de juego para calcular el radio del óvalo
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight
        });
      }
    };

    const observer = typeof ResizeObserver !== 'undefined' && containerRef.current
      ? new ResizeObserver(updateSize)
      : null;

    if (containerRef.current) observer?.observe(containerRef.current);

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Radios de la elipse con margen para avatar, apuesta, texto y escala del turno.
  const RX = Math.max(0, (dimensions.w / 2) - 78);
  const RY = Math.max(0, (dimensions.h / 2) - 92);

  return (
    <div ref={containerRef} style={ringContainerStyle}>
      {players.map((p, i) => {
        // Cálculo de posición angular (0 grados es arriba, giramos según el índice)
        const angle = (i * (360 / players.length)) - 90;
        const radian = angle * (Math.PI / 180);
        
        const x = Math.cos(radian) * RX;
        const y = Math.sin(radian) * RY;

        const isMyTurn = tIdx === i;
        const isFolded = p.status === 'FOLDED';
        const isMe = p.id === myId;

        return (
          <div 
            key={p.id}
            style={{
              ...playerWrapperStyle,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              opacity: isFolded ? 0.4 : 1,
              transform: `translate(-50%, -50%) scale(${isMyTurn ? 1.1 : 1})`,
            }}
          >
            {/* Tag de apuesta actual sobre el avatar */}
            {p.bRound > 0 && (
              <div style={betTagStyle}>
                🪙 {p.bRound.toLocaleString()}
              </div>
            )}

            {/* Avatar circular */}
            <div style={{
              ...avatarStyle,
              borderColor: isMyTurn ? '#38bdf8' : '#334155',
              boxShadow: isMyTurn ? '0 0 20px rgba(56, 189, 248, 0.6)' : 'none',
              background: p.active ? '#1e293b' : '#0f172a'
            }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{p.name[0].toUpperCase()}</span>
              
              {/* Botón Dealer (D) */}
              {dIdx === i && <div style={dealerBadgeStyle}>D</div>}
              
              {/* Botón Expulsar (Solo Host y no a uno mismo) */}
              {isHost && !isMe && (
                <div onClick={() => onKick(p.id)} style={kickBtnStyle}>×</div>
              )}
            </div>

            {/* Información de texto */}
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <div style={{ 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                color: isMe ? '#38bdf8' : 'white',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {isMe ? 'TÚ' : p.name.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981' }}>
                {p.chips.toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Estilos ---
const ringContainerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 5
};

const playerWrapperStyle: React.CSSProperties = {
  position: 'absolute',
  width: '92px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  pointerEvents: 'auto',
  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};

const avatarStyle: React.CSSProperties = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  border: '3px solid',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  transition: 'all 0.3s ease'
};

const betTagStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-25px',
  background: '#fbbf24',
  color: '#000',
  fontSize: '0.65rem',
  fontWeight: 900,
  padding: '2px 8px',
  borderRadius: '10px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
  whiteSpace: 'nowrap'
};

const dealerBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '-5px',
  right: '-5px',
  width: '20px',
  height: '20px',
  background: 'white',
  color: 'black',
  borderRadius: '50%',
  fontSize: '0.7rem',
  fontWeight: 900,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #ccc'
};

const kickBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-5px',
  left: '-5px',
  width: '18px',
  height: '18px',
  background: '#ef4444',
  color: 'white',
  borderRadius: '50%',
  fontSize: '0.8rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontWeight: 'bold'
};
