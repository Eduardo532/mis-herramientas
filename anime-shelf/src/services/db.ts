import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Anime } from '../types/anime';

// --- Constantes ---
const COLLECTION_NAME = 'animes';

// --- Operaciones de Base de Datos ---

export const fetchAnimesDB = async (): Promise<Anime[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  const animes: Anime[] = [];
  querySnapshot.forEach((doc) => {
    animes.push({ id: doc.id, ...doc.data() } as Anime);
  });
  return animes;
};

export const addAnimeDB = async (anime: Omit<Anime, 'id'>): Promise<string> => {
  const newDocRef = doc(collection(db, COLLECTION_NAME));
  await setDoc(newDocRef, anime);
  return newDocRef.id;
};

export const updateAnimeStatusDB = async (id: string, status: Anime['status']): Promise<void> => {
  const animeRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(animeRef, { status });
};

export const deleteAnimeDB = async (id: string): Promise<void> => {
  const animeRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(animeRef);
};

export const addMultipleAnimesDB = async (animes: Omit<Anime, 'id'>[]): Promise<void> => {
  const batch = writeBatch(db);
  animes.forEach((anime) => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    batch.set(docRef, anime);
  });
  await batch.commit();
};