'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <Link 
            href="/privacy-policy" 
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium hover:underline text-sm"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-400 dark:text-gray-600">|</span>
          <Link 
            href="/terms" 
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors font-medium hover:underline text-sm"
          >
            Terms & Conditions
          </Link>
          <span className="text-gray-400 dark:text-gray-600">|</span>
          <Link 
            href="/about" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium hover:underline text-sm"
          >
            About Us
          </Link>
          <span className="text-gray-400 dark:text-gray-600">|</span>
          <Link 
            href="/contact" 
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors font-medium hover:underline text-sm"
          >
            Contact Us
          </Link>
        </div>
        
        {/* Copyright */}
        <div className="text-center border-t border-gray-300 dark:border-gray-700 pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 8rupiya.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

