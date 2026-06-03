import React from 'react';
import { Search, LayoutGrid, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentView: 'Todos' | 'Vistos' | 'Por Ver' | 'Estadísticas';
  setView: (view: 'Todos' | 'Vistos' | 'Por Ver' | 'Estadísticas') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  availableGenres: string[];
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, setView, searchQuery, setSearchQuery, 
  selectedGenre, setSelectedGenre, availableGenres 
}) => {
  return (
    <header className="bg-[#0f172a]/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Sección Superior: Logo y Controles --- */}
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-400">
            AnimeShelf
          </h1>

          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-grow md:w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b]/50 border border-white/10 rounded-[18px] text-sm text-slate-200 focus:outline-none focus:border-sky-400"
              />
            </div>

            {currentView !== 'Estadísticas' && (
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-[#1e293b]/50 border border-white/10 text-slate-200 text-sm rounded-[18px] px-3 outline-none focus:border-sky-400"
              >
                <option value="Todos">Géneros</option>
                {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* --- Pestañas de Navegación --- */}
        <div className="flex space-x-2 pb-[-1px] overflow-x-auto">
          {[
            { name: 'Todos', icon: LayoutGrid },
            { name: 'Por Ver', icon: Clock },
            { name: 'Vistos', icon: CheckCircle2 },
            { name: 'Estadísticas', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setView(tab.name as any)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                currentView === tab.name ? 'border-sky-400 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};