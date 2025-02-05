import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogIn } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const { login, error, loading, isRateLimited } = useAuth();

  useEffect(() => {
    let timer: number;
    const checkRateLimit = () => {
      const { limited, remainingTime } = isRateLimited();
      setRemainingTime(limited ? remainingTime : 0);
    };

    if (remainingTime > 0) {
      timer = window.setInterval(() => {
        checkRateLimit();
      }, 1000);
    }

    checkRateLimit();
    return () => clearInterval(timer);
  }, [remainingTime, isRateLimited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { limited } = isRateLimited();
    if (limited) {
      return;
    }

    await login(email, password);
  };

  const isDisabled = loading || remainingTime > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <LogIn className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {remainingTime > 0 && (
            <div className="rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-700">
                Please wait {remainingTime} seconds before trying again
              </p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isDisabled}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isDisabled}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : remainingTime > 0 ? `Wait ${remainingTime}s` : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}