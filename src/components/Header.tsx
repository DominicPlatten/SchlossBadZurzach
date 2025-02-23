import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Map as MapIcon } from 'lucide-react';
import Logo from './Logo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Ausstellungen', path: '/' },
    { name: 'Karte', path: '/map' },
    { name: 'Künstler', path: '/artists' },
    { name: 'Geschichte', path: '/history' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <Logo />
                <span className="text-xl font-semibold">Schloss Bad Zurzach</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'text-indigo-600'
                      : 'text-gray-700 hover:text-indigo-600'
                  } whitespace-nowrap transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="text-gray-700 hover:text-indigo-600"
              >
                <span className="sr-only">Open menu</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="absolute right-0 h-full w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4">
              <span className="text-lg font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-indigo-600"
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-2 py-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
    </>
  );
}