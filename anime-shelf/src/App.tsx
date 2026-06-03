import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { DataLoader } from './components/DataLoader';
import { AddAnime } from './components/AddAnime';
import { AnimeCard } from './components/AnimeCard';
import { Stats } from './components/Stats';
import { Login } from './components/Login';
import { useAnimeStore } from './store/animeStore';

export const App: React.FC = () => {
  const { animes, fetchAnimes, isLoading, error } = useAnimeStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'Todos' | 'Vistos' | 'Por Ver' | 'Estadísticas'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');

  useEffect(() => {
    const auth = localStorage.getItem('animeShelfAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchAnimes();
    }
  }, [fetchAnimes]);

  // --- Lógica de filtrado ---

  const allGenres = Array.from(new Set(animes.flatMap(a => a.genres.split(', '))));
  
  const filteredAnimes = animes.filter((anime) => {
    const matchesView = currentView === 'Todos' || anime.status === currentView;
    const matchesGenre = selectedGenre === 'Todos' || anime.genres.includes(selectedGenre);
    const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesView && matchesGenre && matchesSearch;
  });

  if (!isAuthenticated) {
    return <Login onLogin={() => { setIsAuthenticated(true); fetchAnimes(); }} />;
  }

  return (
    <div className="min-h-screen text-slate-100 pb-12 bg-[#0f172a]">
      <Header 
        currentView={currentView} 
        setView={setCurrentView} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        availableGenres={allGenres}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {currentView === 'Estadísticas' ? (
          <Stats />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AddAnime />
              <DataLoader />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-[28px] mb-8 font-semibold backdrop-blur-md">
                ⚠️ {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-200">
                    Lista: {currentView} 
                    <span className="text-slate-500 text-sm ml-2">({filteredAnimes.length} animes)</span>
                  </h2>
                </div>

                {filteredAnimes.length === 0 ? (
                  <div className="text-center py-20 bg-[#1e293b]/40 backdrop-blur-md rounded-[28px] border border-white/10">
                    <p className="text-slate-400 text-lg font-medium">No se encontraron animes en esta sección.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredAnimes.map((anime) => (
                      <AnimeCard key={anime.id} anime={anime} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;