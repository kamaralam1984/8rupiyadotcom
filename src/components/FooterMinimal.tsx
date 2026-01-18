'use client';

import Link from 'next/link';
import { FiShoppingBag, FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

export default function FooterMinimal() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    services: [
      { name: 'List Your Business', href: '/register' },
      { name: 'Advertise', href: '/advertise' },
      { name: 'For Agents', href: '/agent/login' },
      { name: 'For Operators', href: '/operator/login' },
    ],
    resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Blog', href: '/blog' },
      { name: 'FAQs', href: '/faq' },
      { name: 'Sitemap', href: '/sitemap' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: FiFacebook, href: 'https://facebook.com/8rupiya' },
    { name: 'Twitter', icon: FiTwitter, href: 'https://twitter.com/8rupiya' },
    { name: 'Instagram', icon: FiInstagram, href: 'https://instagram.com/8rupiya' },
    { name: 'LinkedIn', icon: FiLinkedin, href: 'https://linkedin.com/company/8rupiya' },
  ];

  return (
    <footer className="bg-gray-900 text-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <FiShoppingBag className="h-8 w-8 text-yellow-400" />
              <span className="text-xl font-bold text-white">8rupiya.com</span>
            </Link>
            <p className="text-sm text-white mb-4">
              Find the best local businesses, shops, and services in your area. 
              Discover, connect, and support local businesses.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5 text-yellow-400" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-yellow-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-yellow-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center space-x-2 text-sm">
                <FiMail className="h-4 w-4 text-yellow-400" />
                <a href="mailto:info@8rupiya.com" className="text-yellow-400 hover:text-white transition-colors">
                  info@8rupiya.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <FiPhone className="h-4 w-4 text-yellow-400" />
                <a href="tel:+911234567890" className="text-yellow-400 hover:text-white transition-colors">
                  +91 123 456 7890
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <FiMapPin className="h-4 w-4 mt-1 text-yellow-400" />
                <span className="text-white">India</span>
              </li>
            </ul>

            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-yellow-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-white">
              © {currentYear} 8rupiya.com. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="/privacy" className="text-sm text-yellow-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-yellow-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/sitemap" className="text-sm text-yellow-400 hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
