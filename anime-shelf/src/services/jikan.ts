import axios from 'axios';
import type { JikanAnimeResponse } from '../types/anime';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchAnime = async (title: string, retries = 3): Promise<JikanAnimeResponse | null> => {
  const cleanTitle = title.replace(/[\[\]]/g, ' ').trim();
  
  try {
    const response = await axios.get(`${JIKAN_BASE_URL}/anime`, {
      params: { q: cleanTitle, limit: 1, order_by: 'members', sort: 'desc' }
    });

    if (response.data?.data?.[0]) {
      const item = response.data.data[0];
      
      // Lógica para extraer minutos: "24 min per ep" o "120 min"
      const durationStr = item.duration || "0 min";
      const match = durationStr.match(/(\d+)/);
      const duration = match ? parseInt(match[0]) : 24;

      return {
        ...item,
        duration: duration.toString(), // Guardamos el número limpio
        type: item.type // 'TV' o 'Movie'
      };
    }
    return null;
  } catch (error: any) {
    if (error.response?.status === 429 && retries > 0) {
      await delay(2000);
      return searchAnime(title, retries - 1);
    }
    return null;
  }
};