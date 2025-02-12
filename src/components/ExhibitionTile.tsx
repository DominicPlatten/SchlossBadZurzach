import React from 'react';
import { Link } from 'react-router-dom';
import type { Exhibition } from '../types';

interface ExhibitionTileProps {
  exhibition: Exhibition;
}

export default function ExhibitionTile({ exhibition }: ExhibitionTileProps) {
  return (
    <Link to={`/exhibition/${exhibition.id}`} className="group block">
      <div className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="relative aspect-[16/9]">
          <img
            src={exhibition.mainImage}
            alt={exhibition.title}
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              {exhibition.title}
            </h3>
            <p className="text-gray-200 line-clamp-2 mb-2">{exhibition.shortDescription}</p>
            <p className="text-sm text-gray-300">
              {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}