import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { db, storage, COLLECTIONS, STORAGE_PATHS } from './firebase';
import type { Exhibition, Artist } from '../types';

// Image management
export const uploadImage = async (file: File, folder: 'exhibitions' | 'artists'): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Image must be less than 5MB');
  }

  const filename = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${folder}/${filename}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const deleteImage = async (url: string) => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Continue even if image deletion fails
  }
};

// Artist management
export const getArtists = async (): Promise<Artist[]> => {
  try {
    const artistsRef = collection(db, COLLECTIONS.ARTISTS);
    const snapshot = await getDocs(artistsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Artist[];
  } catch (error) {
    console.error('Error fetching artists:', error);
    throw error;
  }
};

export const getArtist = async (id: string): Promise<Artist | null> => {
  try {
    const artistRef = doc(db, COLLECTIONS.ARTISTS, id);
    const artistDoc = await getDoc(artistRef);
    
    if (!artistDoc.exists()) {
      return null;
    }
    
    return {
      id: artistDoc.id,
      ...artistDoc.data()
    } as Artist;
  } catch (error) {
    console.error('Error fetching artist:', error);
    throw error;
  }
};

export const createArtist = async (data: Omit<Artist, 'id' | 'createdAt' | 'updatedAt' | 'exhibitions'>): Promise<string> => {
  const artistRef = await addDoc(collection(db, COLLECTIONS.ARTISTS), {
    ...data,
    exhibitions: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return artistRef.id;
};

export const updateArtist = async (id: string, data: Partial<Artist>) => {
  const artistRef = doc(db, COLLECTIONS.ARTISTS, id);
  await updateDoc(artistRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteArtist = async (id: string) => {
  const artistRef = doc(db, COLLECTIONS.ARTISTS, id);
  const artistDoc = await getDoc(artistRef);
  
  if (artistDoc.exists()) {
    const data = artistDoc.data() as Artist;
    
    // Delete main image
    if (data.mainImage) {
      await deleteImage(data.mainImage);
    }
    
    // Delete portfolio images
    if (data.portfolio) {
      await Promise.all(data.portfolio.map(item => deleteImage(item.imageUrl)));
    }
  }
  
  await deleteDoc(artistRef);
};

// Exhibition management
export const getExhibitions = async (): Promise<Exhibition[]> => {
  try {
    const exhibitionsRef = collection(db, COLLECTIONS.EXHIBITIONS);
    const snapshot = await getDocs(exhibitionsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Exhibition[];
  } catch (error) {
    console.error('Error fetching exhibitions:', error);
    throw error;
  }
};

export const getExhibition = async (id: string): Promise<Exhibition | null> => {
  try {
    const exhibitionRef = doc(db, COLLECTIONS.EXHIBITIONS, id);
    const exhibitionDoc = await getDoc(exhibitionRef);
    
    if (!exhibitionDoc.exists()) {
      return null;
    }
    
    return {
      id: exhibitionDoc.id,
      ...exhibitionDoc.data()
    } as Exhibition;
  } catch (error) {
    console.error('Error fetching exhibition:', error);
    throw error;
  }
};

export const getFeaturedExhibition = async (): Promise<Exhibition | null> => {
  try {
    const exhibitionsRef = collection(db, COLLECTIONS.EXHIBITIONS);
    const snapshot = await getDocs(exhibitionsRef);
    
    if (snapshot.empty) return null;
    
    const exhibitions = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exhibition[];
    
    // First try to find a featured exhibition
    const featured = exhibitions.find(ex => ex.isFeatured);
    if (featured) return featured;
    
    // If no featured exhibition, return the most recent one
    return exhibitions.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0] || null;
  } catch (error) {
    console.error('Error fetching featured exhibition:', error);
    throw error;
  }
};

export const createExhibition = async (data: Omit<Exhibition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const exhibitionRef = await addDoc(collection(db, COLLECTIONS.EXHIBITIONS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return exhibitionRef.id;
};

export const updateExhibition = async (id: string, data: Partial<Exhibition>) => {
  const exhibitionRef = doc(db, COLLECTIONS.EXHIBITIONS, id);
  await updateDoc(exhibitionRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteExhibition = async (id: string) => {
  const exhibitionRef = doc(db, COLLECTIONS.EXHIBITIONS, id);
  const exhibitionDoc = await getDoc(exhibitionRef);
  
  if (exhibitionDoc.exists()) {
    const data = exhibitionDoc.data() as Exhibition;
    // Delete main image
    if (data.mainImage) {
      await deleteImage(data.mainImage);
    }
    // Delete gallery images
    if (data.gallery) {
      await Promise.all(data.gallery.map(url => deleteImage(url)));
    }
  }
  
  await deleteDoc(exhibitionRef);
};