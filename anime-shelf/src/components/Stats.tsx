import React, { useState, useMemo } from 'react';
import { useAnimeStore } from '../store/animeStore';
import { PieChart, Clock, BarChart3, TrendingUp } from 'lucide-react';

export const Stats: React.FC = () => {
  const { animes } = useAnimeStore();
  const [format, setFormat] = useState<'min' | 'hours' | 'days'>('hours');

  const stats = useMemo(() => {
    const vistos = animes.filter(a => a.status === 'Vistos');
    const totalMin = vistos.reduce((acc, a) => acc + (a.episodes * a.durationPerEpisode), 0);
    
    // --- Análisis de géneros ---
    const genresMap: Record<string, number> = {};
    vistos.forEach(a => a.genres.split(', ').forEach(g => {
      const genre = g.trim();
      if (genre) genresMap[genre] = (genresMap[genre] || 0) + 1;
    }));

    return {
      total: vistos.length,
      tiempo: totalMin,
      top: Object.entries(genresMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
    };
  }, [animes]);

  const getTime = () => {
    if (format === 'min') return `${stats.tiempo} min`;
    if (format === 'hours') return `${(stats.tiempo / 60).toFixed(1)} h`;
    return `${(stats.tiempo / 1440).toFixed(2)} días`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-[#1e293b]/70 backdrop-blur-md rounded-[28px] border border-white/10">
      
      {/* --- Indicador de Tiempo --- */}
      <div className="cursor-pointer p-4 hover:bg-white/5 rounded-2xl transition-colors" onClick={() => setFormat(f => f === 'min' ? 'hours' : f === 'hours' ? 'days' : 'min')}>
        <p className="text-slate-400 text-xs uppercase font-bold flex gap-2"><Clock className="w-4 h-4"/> Tiempo total</p>
        <p className="text-3xl font-black text-white">{getTime()}</p>
      </div>

      {/* --- Indicador de Cantidad --- */}
      <div className="p-4">
        <p className="text-slate-400 text-xs uppercase font-bold flex gap-2"><PieChart className="w-4 h-4"/> Animes Vistos</p>
        <p className="text-3xl font-black text-emerald-400">{stats.total}</p>
      </div>

      {/* --- Indicador de Géneros --- */}
      <div className="p-4">
        <p className="text-slate-400 text-xs uppercase font-bold flex gap-2"><TrendingUp className="w-4 h-4"/> Top Géneros</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {stats.top.map(([g, c]) => (
            <span key={g} className="bg-sky-500/10 text-sky-300 text-[10px] px-2 py-1 rounded-full border border-sky-500/20">
              {g} ({c})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};