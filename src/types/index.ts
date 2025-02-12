import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface Exhibition {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  mainImage: string;
  gallery: string[];
  startDate: string;
  endDate: string;
  artistIds: string[];
  isFeatured: boolean;
  visitorInfo: {
    hours: string;
    ticketInfo: string;
    location: string;
  };
  additionalInfo?: {
    sections: Array<{
      title: string;
      content: string;
      order: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  mainImage: string;
  portfolio: {
    imageUrl: string;
    title: string;
    year: string;
  }[];
  exhibitions: string[];
  createdAt: string;
  updatedAt: string;
  detailedBio?: string;
  website?: string;
  documents?: {
    title: string;
    url: string;
    type: 'pdf';
    category: 'sales' | 'other';
  }[];
  socialLinks?: {
    platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
    url: string;
  }[];
}

export interface ArtLocation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  artistId: string;
  coordinates: {
    x: number;
    y: number;
  };
  documentUrl?: string;
  documentTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MapContent {
  id: string;
  parkDescription: string;
  legend: Array<{
    number: number;
    title: string;
    artistId: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryContent {
  id: string;
  mainText: string;
  milestones: {
    year: number;
    title: string;
    description: string;
  }[];
  createdAt: string;
  updatedAt: string;
}