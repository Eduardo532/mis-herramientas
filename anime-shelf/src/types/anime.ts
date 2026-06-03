export type AnimeStatus = 'Vistos' | 'Por Ver' | 'Buscando';

export interface Anime {
  id: string;
  malId: number;
  title: string;
  genres: string;
  episodes: number;
  durationPerEpisode: number;
  isMovie: boolean;
  imageUrl?: string;
  synopsis?: string;
  score?: number;
  year?: number;
  status: AnimeStatus;
  addedAt: number;
}

export interface JikanAnimeResponse {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  synopsis: string;
  episodes: number;
  duration: string;
  score: number;
  year: number;
  genres: Array<{ name: string }>;
  type: string;
}