import { create } from 'zustand';
import type { Anime, AnimeStatus } from '../types/anime';
import { fetchAnimesDB, addAnimeDB, updateAnimeStatusDB, deleteAnimeDB } from '../services/db';

interface AnimeState {
  animes: Anime[];
  isLoading: boolean;
  error: string | null;
  fetchAnimes: () => Promise<void>;
  addAnime: (anime: Omit<Anime, 'id'>) => Promise<void>;
  updateStatus: (id: string, status: AnimeStatus) => Promise<void>;
  removeAnime: (id: string) => Promise<void>;
}

export const useAnimeStore = create<AnimeState>()((set, get) => ({
  animes: [],
  isLoading: false,
  error: null,

  fetchAnimes: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAnimesDB();
      const uniqueAnimes = Array.from(new Map(data.map(item => [item.malId, item])).values());
      set({ animes: uniqueAnimes.sort((a, b) => b.addedAt - a.addedAt), isLoading: false });
    } catch (error) {
      set({ error: 'Error cargando lista', isLoading: false });
    }
  },

  addAnime: async (anime) => {
    const { animes } = get();
    if (animes.find(a => a.malId === anime.malId)) return;

    try {
      const id = await addAnimeDB(anime);
      set((state) => ({ animes: [{ ...anime, id }, ...state.animes] }));
    } catch (error) {
      set({ error: 'No se pudo guardar el anime' });
    }
  },

  updateStatus: async (id, status) => {
    await updateAnimeStatusDB(id, status);
    set((state) => ({
      animes: state.animes.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
  },

  removeAnime: async (id) => {
    await deleteAnimeDB(id);
    set((state) => ({ animes: state.animes.filter((a) => a.id !== id) }));
  },
}));