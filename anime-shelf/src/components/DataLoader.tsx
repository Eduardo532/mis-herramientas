import React, { useState } from 'react';
import Papa from 'papaparse';
import { useAnimeStore } from '../store/animeStore';
import { searchAnime, delay } from '../services/jikan';
import type { AnimeStatus } from '../types/anime';
import { Upload, FileUp } from 'lucide-react';

export const DataLoader: React.FC = () => {
  const { addAnime } = useAnimeStore();
  const [targetList, setTargetList] = useState<AnimeStatus>('Por Ver');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [status, setStatus] = useState<string>('');

  const processFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus('Procesando archivo...');
    
    const reader = new FileReader();
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    reader.onload = async (event) => {
      let titles: string[] = [];

      if (fileExt === 'json') {
        const data = JSON.parse(event.target?.result as string);
        titles = data.map((item: any) => item.Titulo || item.title || item['Anime Title']).filter(Boolean);
      } else if (fileExt === 'csv') {
        const results = Papa.parse(event.target?.result as string, { header: true });
        titles = results.data.map((row: any) => row['Anime Title'] || row['Titulo']).filter(Boolean);
      }

      const uniqueTitles = Array.from(new Set(titles));
      await enrichAndSave(uniqueTitles, targetList);
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const enrichAndSave = async (titles: string[], status: AnimeStatus) => {
    setProgress({ current: 0, total: titles.length });

    for (let i = 0; i < titles.length; i++) {
      setStatus(`Procesando: ${titles[i]}`);
      const jikanData = await searchAnime(titles[i]);

      if (jikanData) {
        await addAnime({
          malId: jikanData.mal_id,
          title: jikanData.title,
          genres: jikanData.genres.map((g: any) => g.name).join(', '),
          episodes: jikanData.episodes || 0,
          durationPerEpisode: parseInt(jikanData.duration) || 24,
          isMovie: jikanData.type === 'Movie',
          imageUrl: jikanData.images.jpg.large_image_url,
          synopsis: jikanData.synopsis,
          score: jikanData.score,
          year: jikanData.year,
          status: status,
          addedAt: Date.now()
        });
      }

      setProgress({ current: i + 1, total: titles.length });
      await delay(1600);
    }
    setStatus('Importación completada.');
    setIsProcessing(false);
  };

  return (
    <div className="bg-[#1e293b]/70 backdrop-blur-xl p-6 rounded-[28px] border border-white/10 shadow-lg mb-6">
      <h2 className="text-lg font-bold mb-4 text-slate-100 flex items-center gap-2">
        <Upload className="w-5 h-5 text-sky-400" /> Importar Biblioteca
      </h2>
      
      <div className="flex flex-col gap-3">
        <select 
          value={targetList} 
          onChange={(e) => setTargetList(e.target.value as AnimeStatus)}
          className="bg-[#0f172a] border border-white/10 text-slate-200 rounded-[14px] p-3 outline-none"
        >
          <option value="Por Ver">Mover a: Por Ver</option>
          <option value="Visto">Mover a: Visto</option>
        </select>

        <label className="flex items-center justify-center gap-2 bg-sky-500/10 border-2 border-dashed border-sky-500/30 rounded-[14px] p-4 cursor-pointer hover:bg-sky-500/20 transition-all">
          <FileUp className="text-sky-400" />
          <span className="text-sm font-bold text-sky-400">Seleccionar archivo JSON/CSV</span>
          <input type="file" accept=".json,.csv" className="hidden" onChange={processFile} disabled={isProcessing} />
        </label>
      </div>

      {isProcessing && (
        <div className="mt-4">
          <div className="text-xs text-slate-400 mb-1">{status}</div>
          <div className="w-full bg-[#0f172a] h-2 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full transition-all" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};