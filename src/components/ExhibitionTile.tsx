import React from 'react';
import { Link } from 'react-router-dom';
import type { Exhibition } from '../types';

interface ExhibitionTileProps {
  exhibition: Exhibition;
}

export default function ExhibitionTile({ exhibition }: ExhibitionTileProps) {
  return (
    <Link to={`/exhibition/${exhibition.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={exhibition.mainImage}
          alt={exhibition.title}
          className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-semibold text-xl">{exhibition.title}</h3>
          <p className="text-gray-200 text-sm">
            {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}