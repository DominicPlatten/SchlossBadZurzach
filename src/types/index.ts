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
  createdAt: string;
  updatedAt: string;
}