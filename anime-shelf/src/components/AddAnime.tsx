import React, { useState } from 'react';
import { Search, Loader2, Plus } from 'lucide-react';
import { useAnimeStore } from '../store/animeStore';
import { searchAnime } from '../services/jikan';
import type { Anime, AnimeStatus } from '../types/anime';

export const AddAnime: React.FC = () => {
  const { addAnime } = useAnimeStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AnimeStatus>('Por Ver');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setMessage({ text: 'Consultando base de datos...', type: 'info' });

    const jikanData = await searchAnime(query);

    if (jikanData) {
      const newAnime: Omit<Anime, 'id'> = {
        title: jikanData.title,
        genres: jikanData.genres ? jikanData.genres.map((g: any) => g.name).join(', ') : 'Sin clasificar',
        episodes: jikanData.episodes || 0,
        imageUrl: jikanData.images.jpg.large_image_url,
        synopsis: jikanData.synopsis || 'Sinopsis no disponible.',
        score: jikanData.score || 0,
        year: jikanData.year || new Date().getFullYear(),
        status: status,
        addedAt: Date.now()
      };

      await addAnime(newAnime);
      setMessage({ text: `✅ "${jikanData.title}" agregado con éxito.`, type: 'success' });
      setQuery('');
    } else {
      setMessage({ text: '❌ No se encontró el anime. Intenta el nombre en inglés o japonés.', type: 'error' });
    }
    
    setIsLoading(false);
    setTimeout(() => setMessage({ text: '', type: '' }), 5000); // Limpiar mensaje a los 5 seg
  };

  return (
    <div className="bg-[#1e293b]/70 backdrop-blur-xl p-6 rounded-[28px] border border-white/10 shadow-lg mb-6 transition-all hover:border-emerald-400/50">
      <h2 className="text-xl font-bold mb-4 text-slate-100 flex items-center gap-2">
        <Plus className="text-emerald-400" /> Añadir Rápido
      </h2>
      
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: Shingeki no Kyojin..."
            disabled={isLoading}
            className="w-full pl-11 pr-4 py-3 bg-[#0f172a]/50 border border-white/10 rounded-[18px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all disabled:opacity-50"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AnimeStatus)}
          disabled={isLoading}
          className="bg-[#0f172a]/50 border border-white/10 text-slate-200 rounded-[18px] focus:outline-none focus:border-emerald-400 px-4 py-3 md:w-40 disabled:opacity-50 cursor-pointer"
        >
          <option value="Por Ver">A Por Ver</option>
          <option value="Vistos">A Vistos</option>
        </select>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white font-bold py-3 px-6 rounded-[18px] transition-all disabled:opacity-50 flex items-center justify-center min-w-[140px]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Agregar'}
        </button>
      </form>

      {message.text && (
        <div className={`mt-4 text-sm font-bold ${message.type === 'error' ? 'text-red-400' : message.type === 'success' ? 'text-emerald-400' : 'text-sky-400'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};