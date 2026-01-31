'use client';

import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const Layout = ({ children }: { children: ReactNode }) => {
  const { logoutUser, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                TaskFlow
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
