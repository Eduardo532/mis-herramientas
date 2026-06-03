import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

// Este es el Hash SHA-256 de la palabra "admin"
// Para cambiar tu contraseña, escribe la que quieras en el login, 
// abre la consola (F12) y copia el nuevo Hash que aparecerá ahí.
const VALID_HASH = '0397c7a890735d9b7df77535cd817d280336d291da83116afb5aff4a09119780';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Encriptar la contraseña ingresada
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === VALID_HASH) {
      localStorage.setItem('animeShelfAuth', 'true');
      onLogin();
    } else {
      setError(true);
      console.log("El Hash encriptado de lo que escribiste es:", hashHex);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#1e293b]/70 backdrop-blur-xl p-8 rounded-[28px] border border-white/10 shadow-2xl w-full max-w-md transition-all">
        <div className="flex justify-center mb-6">
          <div className="bg-sky-400/10 p-4 rounded-full border border-sky-400/20 text-sky-400">
            {error ? <Lock className="w-8 h-8 text-red-400" /> : <Unlock className="w-8 h-8" />}
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-400">
          AnimeShelf Protegido
        </h2>
        <p className="text-slate-400 text-sm text-center mb-8">
          Ingresa la clave de acceso maestra para continuar.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="••••••••"
              className={`w-full px-4 py-3 bg-[#0f172a]/50 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-sky-400'} rounded-[18px] text-slate-200 placeholder-slate-500 focus:outline-none transition-all text-center tracking-widest text-lg`}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-900 font-bold py-3 px-4 rounded-[18px] transition-all transform hover:-translate-y-0.5 shadow-lg"
          >
            Desbloquear Bóveda
          </button>
        </form>
      </div>
    </div>
  );
};