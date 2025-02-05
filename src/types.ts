export interface Artist {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
}

export interface Exhibition {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  artistId: string;
  isFeatured?: boolean;
}