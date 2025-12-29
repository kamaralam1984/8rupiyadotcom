'use client';

import Link from 'next/link';

export default function JyotishFooter() {
  return (
    <footer className="pb-8 px-4 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="border-t border-yellow-500/30 pt-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">8rupiya Jyotish</h3>
              <p className="text-gray-400 text-sm">
                AI-powered astrology platform providing authentic Vedic insights, kundli generation, and expert consultations.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/jyotish" className="hover:text-yellow-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/jyotish/chatbot" className="hover:text-yellow-400 transition-colors">
                    AI Chatbot
                  </Link>
                </li>
                <li>
                  <Link href="/jyotish/kundli" className="hover:text-yellow-400 transition-colors">
                    Kundli Generator
                  </Link>
                </li>
                <li>
                  <Link href="/jyotish/marketplace" className="hover:text-yellow-400 transition-colors">
                    Pandit Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/jyotish/toolset" className="hover:text-yellow-400 transition-colors">
                    Jyotish Toolset
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: support@8rupiya.com</li>
                <li>Phone: +91 XXX XXX XXXX</li>
                <li className="flex space-x-4 pt-2">
                  <a href="#" className="hover:text-yellow-400 transition-colors">Facebook</a>
                  <a href="#" className="hover:text-yellow-400 transition-colors">Twitter</a>
                  <a href="#" className="hover:text-yellow-400 transition-colors">Instagram</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center text-gray-400 text-sm">
            <p>© 2025 8rupiya.com. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy-policy" className="hover:text-yellow-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-yellow-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

