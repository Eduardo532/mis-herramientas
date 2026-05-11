import React, { useState } from 'react';
import { RoomConfig } from '../types/poker';

interface LobbyProps {
  myId: string;
  onCreateRoom: (nick: string, cfg: RoomConfig) => void;
  onJoinRoom: (nick: string, roomId: string) => void;
}

export function Lobby({ myId, onCreateRoom, onJoinRoom }: LobbyProps) {
  const [nick, setNick] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [stack, setStack] = useState(10000);
  const [bb, setBb] = useState(100);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim()) {
      alert('Por favor, ingresa un apodo.');
      return;
    }
    onCreateRoom(nick.trim(), { stack, sb: Math.round(bb / 2), bb });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim() || !roomCode.trim()) {
      alert('Por favor, ingresa tu apodo y el código de la sala.');
      return;
    }
    onJoinRoom(nick.trim(), roomCode.trim().toUpperCase());
  };

  return (
    <div style={lobbyWrapperStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 20px 0', fontSize: '1.8rem', color: 'white', textAlign: 'center' }}>
          🃏 Poker Texas Pro
        </h1>

        {/* Formulario principal para apodo */}
        <div style={formGroupStyle}>
          <label htmlFor="playerNickname" style={labelStyle}>TU APODO</label>
          <input
            id="playerNickname"
            name="playerNickname"
            type="text"
            placeholder="Ej. Jugador1"
            value={nick}
            onChange={e => setNick(e.target.value)}
            style={inputStyle}
            autoComplete="username"
          />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '20px 0' }} />

        {/* Sección: Unirse a sala */}
        <form onSubmit={handleJoin} style={{ marginBottom: '20px' }}>
          <div style={formGroupStyle}>
            <label htmlFor="roomCodeInput" style={labelStyle}>CÓDIGO DE SALA</label>
            <input
              id="roomCodeInput"
              name="roomCodeInput"
              type="text"
              placeholder="Ej. A1B2C"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value)}
              style={{ ...inputStyle, textTransform: 'uppercase' }}
              autoComplete="off"
            />
          </div>
          <button type="submit" style={{ ...btnStyle, background: '#38bdf8', color: '#0f172a' }}>
            UNIRSE A SALA
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '20px 0' }} />

        {/* Sección: Crear sala */}
        <form onSubmit={handleCreate}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="initialStackInput" style={labelStyle}>FICHAS INICIALES</label>
              <input
                id="initialStackInput"
                name="initialStackInput"
                type="number"
                value={stack}
                step={500}
                onChange={e => setStack(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="bigBlindInput" style={labelStyle}>CIEGA GRANDE (BB)</label>
              <input
                id="bigBlindInput"
                name="bigBlindInput"
                type="number"
                value={bb}
                step={50}
                onChange={e => setBb(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>
          <button type="submit" style={{ ...btnStyle, background: '#10b981', color: 'white' }}>
            CREAR NUEVA SALA
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Estilos ---
const lobbyWrapperStyle: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0f172a',
  padding: '20px',
  boxSizing: 'border-box'
};

const cardStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '16px',
  padding: '30px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '15px'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 800,
  color: '#94a3b8',
  marginBottom: '6px',
  display: 'block'
};

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #334155',
  background: '#0f172a',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 600,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '10px',
  border: 'none',
  fontSize: '1rem',
  fontWeight: 900,
  cursor: 'pointer',
  transition: 'opacity 0.2s'
};