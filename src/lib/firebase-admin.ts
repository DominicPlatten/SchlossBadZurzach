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
  setDoc
} from 'firebase/firestore';
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { db, storage, COLLECTIONS, STORAGE_PATHS } from './firebase';
import type { Exhibition, Artist, ArtLocation, MapContent } from '../types';

export const uploadImage = async (file: File, folder: 'exhibitions' | 'artists' | 'map' | 'artLocations', filename?: string): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Image must be less than 5MB');
  }

  const actualFilename = filename || `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${folder}/${actualFilename}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const uploadDocument = async (file: File): Promise<string> => {
  if (file.type !== 'application/pdf') {
    throw new Error('File must be a PDF');
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Document must be less than 10MB');
  }

  try {
    const filename = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `documents/${filename}`);
    
    const metadata = {
      contentType: 'application/pdf',
    };
    
    await uploadBytes(storageRef, file, metadata);
    return getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload document. Please try again.');
  }
};

export const getPdfUrl = async (filename: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `documents/${filename}`);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw new Error('Failed to get PDF URL');
  }
};

export const getMapUrl = async (): Promise<string> => {
  try {
    const mapRef = ref(storage, `${STORAGE_PATHS.MAP}/current.jpg`);
    return await getDownloadURL(mapRef);
  } catch (error) {
    console.error('Error getting map URL:', error);
    throw error;
  }
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

// Art Location management
export const getArtLocations = async (): Promise<ArtLocation[]> => {
  try {
    const locationsRef = collection(db, COLLECTIONS.ART_LOCATIONS);
    const snapshot = await getDocs(locationsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ArtLocation[];
  } catch (error) {
    console.error('Error fetching art locations:', error);
    throw error;
  }
};

export const createArtLocation = async (data: Omit<ArtLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Create a new document with a generated ID
    const newDocRef = doc(collection(db, COLLECTIONS.ART_LOCATIONS));
    
    // Set the document data
    await setDoc(newDocRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return newDocRef.id;
  } catch (error) {
    console.error('Error creating art location:', error);
    throw error;
  }
};

export const updateArtLocation = async (id: string, data: Partial<ArtLocation>) => {
  const locationRef = doc(db, COLLECTIONS.ART_LOCATIONS, id);
  await updateDoc(locationRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteArtLocation = async (id: string) => {
  const locationRef = doc(db, COLLECTIONS.ART_LOCATIONS, id);
  await deleteDoc(locationRef);
};

// Map Content management
export const getMapContent = async (): Promise<MapContent | null> => {
  try {
    const mapContentRef = collection(db, COLLECTIONS.MAP_CONTENT);
    const snapshot = await getDocs(mapContentRef);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as MapContent;
  } catch (error) {
    console.error('Error fetching map content:', error);
    throw error;
  }
};

export const createMapContent = async (data: Omit<MapContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const mapContentRef = await addDoc(collection(db, COLLECTIONS.MAP_CONTENT), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return mapContentRef.id;
};

export const updateMapContent = async (id: string, data: Partial<MapContent>) => {
  const mapContentRef = doc(db, COLLECTIONS.MAP_CONTENT, id);
  await updateDoc(mapContentRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getHistoryContent = async (): Promise<HistoryContent | null> => {
  try {
    const historyRef = collection(db, COLLECTIONS.HISTORY_CONTENT);
    const snapshot = await getDocs(historyRef);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as HistoryContent;
  } catch (error) {
    console.error('Error fetching history content:', error);
    throw error;
  }
};

export const createHistoryContent = async (data: Omit<HistoryContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const historyRef = await addDoc(collection(db, COLLECTIONS.HISTORY_CONTENT), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return historyRef.id;
};

export const updateHistoryContent = async (id: string, data: Partial<HistoryContent>) => {
  const historyRef = doc(db, COLLECTIONS.HISTORY_CONTENT, id);
  await updateDoc(historyRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};