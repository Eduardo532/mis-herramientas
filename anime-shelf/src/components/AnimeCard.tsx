import React, { useState } from 'react';
import type { Anime } from '../types/anime';
import { useAnimeStore } from '../store/animeStore';
import { CheckCircle2, Clock, Trash2 } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const { updateStatus, removeAnime } = useAnimeStore();
  const [imgSrc, setImgSrc] = useState(anime.imageUrl || `https://placehold.co/225x318/1e293b/38bdf8/png?text=Sin+Imagen`);

  const isVisto = anime.status === 'Vistos';

  return (
    <div className="bg-[#1e293b]/70 backdrop-blur-md rounded-[28px] overflow-hidden border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:bg-[#1e293b]/95 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex flex-col h-full group">
      <div className="relative h-72 w-full bg-[#0f172a]">
        <img
          src={imgSrc}
          alt={anime.title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          onError={() => setImgSrc(`https://placehold.co/225x318/1e293b/38bdf8/png?text=Fallo+Carga`)}
        />
        <div className="absolute top-3 right-3 bg-[#0f172a]/80 backdrop-blur-md text-xs font-bold px-2.5 py-1 rounded-xl border border-white/10 text-slate-200">
          {anime.episodes > 0 ? `${anime.episodes} EPS` : 'EPS ?'}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg leading-tight mb-1 text-slate-100 line-clamp-2" title={anime.title}>
          {anime.title}
        </h3>
        <p className="text-xs text-sky-400 mb-3 line-clamp-1 font-semibold" title={anime.genres}>
          {anime.genres || 'Sin géneros definidos'}
        </p>

        {anime.synopsis ? (
          <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-grow" title={anime.synopsis}>
            {anime.synopsis}
          </p>
        ) : (
          <div className="flex-grow"></div>
        )}

        {/* CONTROLES MEJORADOS */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-2">
          <button
            onClick={() => updateStatus(anime.id, isVisto ? 'Por Ver' : 'Vistos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[14px] text-sm font-bold transition-all border ${
              isVisto 
                ? 'bg-[#0f172a]/50 text-slate-400 border-white/10 hover:bg-[#0f172a]/80 hover:text-amber-400' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
            }`}
          >
            {isVisto ? (
              <><Clock className="w-4 h-4" /> A Por Ver</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Marcar Visto</>
            )}
          </button>

          <button
            onClick={() => removeAnime(anime.id)}
            className="flex items-center justify-center p-2.5 rounded-[14px] text-red-400 bg-red-500/10 border border-transparent hover:bg-red-500 hover:text-white transition-all"
            title="Eliminar de la colección"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};