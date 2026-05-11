import React, { useState } from 'react';
import { RoomConfig } from '../types/poker';

interface LobbyProps {
  myId: string;
  onCreateRoom: (nick: string, config: RoomConfig) => void;
  onJoinRoom: (nick: string, roomId: string) => void;
}

export function Lobby({ myId, onCreateRoom, onJoinRoom }: LobbyProps) {
  const [nick, setNick] = useState('');
  const [targetRoom, setTargetRoom] = useState('');
  const [stack, setStack] = useState(10000);
  const [sb, setSb] = useState(50);
  const [bb, setBb] = useState(100);

  const isNickValid = nick.trim().length >= 2;

  return (
    <div style={{
      margin: 'auto', width: '90%', maxWidth: '400px', padding: '2rem',
      background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(16px)',
      borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      color: 'white', textAlign: 'center'
    }}>
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 900, letterSpacing: '-1px', fontSize: '1.8rem' }}>
        POKER <span style={{ color: '#38bdf8' }}>PRO</span>
      </h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'left', marginBottom: '4px' }}>TU APODO</label>
        <input 
          type="text" 
          placeholder="Ej: Lalo" 
          value={nick} 
          onChange={(e) => setNick(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800, marginBottom: '10px', textAlign: 'left' }}>NUEVA MESA</p>
        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>STACK INICIAL</label>
          <input type="number" value={stack} onChange={e => setStack(Number(e.target.value))} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>CIEGA PEQ.</label>
            <input type="number" value={sb} onChange={e => setSb(Number(e.target.value))} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>CIEGA GRANDE</label>
            <input type="number" value={bb} onChange={e => setBb(Number(e.target.value))} style={inputStyle} />
          </div>
        </div>
        <button 
          disabled={!isNickValid} 
          onClick={() => onCreateRoom(nick, { stack, sb, bb })}
          style={{ ...btnStyle, background: '#38bdf8', color: '#0f172a' }}
        >
          CREAR SALA
        </button>
      </div>

      <div style={{ textAlign: 'center', margin: '1rem 0', opacity: 0.3, fontSize: '0.8rem' }}>— O —</div>

      <div>
        <input 
          type="text" 
          placeholder="ID de la sala" 
          value={targetRoom} 
          onChange={e => setTargetRoom(e.target.value.toUpperCase())}
          style={inputStyle} 
        />
        <button 
          disabled={!isNickValid || !targetRoom} 
          onClick={() => onJoinRoom(nick, targetRoom)}
          style={{ ...btnStyle, background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8' }}
        >
          UNIRSE A MESA
        </button>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.65rem', color: '#64748b' }}>
        Tu ID Técnico: <span style={{ fontFamily: 'monospace' }}>{myId || 'Generando...'}</span>
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', background: 'rgba(15, 23, 42, 0.5)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
  color: 'white', fontSize: '1rem', outline: 'none'
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.6rem', color: '#94a3b8', textAlign: 'left', marginBottom: '4px'
};

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '14px', border: 'none', borderRadius: '12px',
  fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
  marginTop: '5px'
};