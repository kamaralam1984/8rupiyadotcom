'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function JyotishNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Kundli', href: '/jyotish/kundli' },
    { name: 'Chatbot', href: '/jyotish/chatbot' },
    { name: 'Marketplace', href: '/jyotish/marketplace' },
    { name: 'Toolset', href: '/jyotish/toolset' },
    { name: 'Pricing', href: '/jyotish/pricing' }
  ];

  return (
    <header className="p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <Link href="/jyotish" className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="8rupiya" className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">8rupiya</h1>
            <p className="text-xs text-gray-400">Jyotish</p>
          </div>
        </Link>
        
        <nav className="hidden md:flex space-x-6 text-gray-300">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-yellow-400 transition-colors ${
                pathname === item.href ? 'text-yellow-400 font-semibold' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <button className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-full hover:shadow-lg hover:shadow-yellow-500/50 transition-all">
          Try Now
        </button>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-300 hover:text-yellow-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}

