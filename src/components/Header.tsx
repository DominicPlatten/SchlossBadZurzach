import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Map as MapIcon } from 'lucide-react';
import Logo from './Logo';

export default function Header() {
  return (
    <>
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-3">
              <Logo />
              <span className="text-xl font-semibold">Schloss Bad Zurzach</span>
            </Link>
            <div className="flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-indigo-600">Exhibitions</Link>
              <Link to="/map" className="text-gray-700 hover:text-indigo-600">Map</Link>
              <Link to="/artists" className="text-gray-700 hover:text-indigo-600">Artists</Link>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}