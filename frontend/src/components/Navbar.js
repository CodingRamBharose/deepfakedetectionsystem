'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-[#0a0e1a]/80 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold tracking-wider">
              <span className="text-white">DETECT</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link 
              href="/upload" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/upload' 
                  ? 'text-cyan-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Upload
            </Link>
            <Link 
              href="/results" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/results' 
                  ? 'text-cyan-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Results
            </Link>
            <Link 
              href="/awareness" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/awareness' 
                  ? 'text-cyan-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Awareness
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
