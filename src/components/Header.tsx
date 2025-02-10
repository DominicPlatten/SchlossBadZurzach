import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Map as MapIcon } from 'lucide-react';
import Logo from './Logo';

export default function Header() {
  return (
    <>
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-0">
          <div className="flex flex-col sm:flex-row sm:h-16">
            <div className="flex items-center justify-between sm:justify-start flex-shrink-0">
              <Link to="/" className="flex items-center space-x-3">
                <Logo />
                <span className="text-xl font-semibold">Schloss Bad Zurzach</span>
              </Link>
            </div>
            <div className="flex items-center justify-center sm:justify-end sm:ml-auto py-2 sm:py-0">
              <div className="flex space-x-6">
                <Link to="/" className="text-gray-700 hover:text-indigo-600 whitespace-nowrap">Ausstellungen</Link>
                <Link to="/map" className="text-gray-700 hover:text-indigo-600 whitespace-nowrap">Karte</Link>
                <Link to="/artists" className="text-gray-700 hover:text-indigo-600 whitespace-nowrap">Künstler</Link>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
    </>
  );
}