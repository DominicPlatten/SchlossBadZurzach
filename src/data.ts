import { Artist, Exhibition } from './types';

export const artists: Artist[] = [
  {
    id: '1',
    name: 'Elena Rodriguez',
    bio: 'Contemporary artist known for large-scale installations and multimedia works exploring themes of nature and technology.',
    imageUrl: 'https://images.unsplash.com/photo-1508186225823-0963cf9ab0de?w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Marcus Chen',
    bio: 'Digital artist and photographer whose work examines urban landscapes and human connection in the modern age.',
    imageUrl: 'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=800&auto=format&fit=crop',
  },
];

export const exhibitions: Exhibition[] = [
  {
    id: '1',
    title: 'Digital Horizons',
    description: 'An immersive journey through digital landscapes and virtual realities, featuring interactive installations that challenge our perception of space and time.',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&auto=format&fit=crop',
    startDate: '2024-03-15',
    endDate: '2024-06-30',
    artistId: '1',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Urban Perspectives',
    description: 'A photographic exploration of city life and architecture through the lens of cultural identity and social change.',
    imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800&auto=format&fit=crop',
    startDate: '2024-04-01',
    endDate: '2024-07-15',
    artistId: '2',
  },
];