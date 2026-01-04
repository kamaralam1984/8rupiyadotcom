'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.adminDashboard': 'Admin Dashboard',
    'nav.userMenu': 'User menu',
    
    // Hero Section
    'hero.searchPlaceholder': 'Search for shops, services...',
    'hero.findShops': 'Find Shops Near You',
    'hero.discover': 'Discover the best local businesses in your area',
    
    // Categories
    'category.all': 'All Categories',
    'category.select': 'Select Category',
    
    // Shops
    'shop.featured': 'Featured Shops',
    'shop.premium': 'Premium Shops',
    'shop.topRated': 'Top Rated Shops',
    'shop.nearby': 'Nearby Shops',
    'shop.allShops': 'Nearby Shops',
    'shop.in': 'Shops in',
    'shop.rating': 'Rating',
    'shop.reviews': 'Reviews',
    'shop.distance': 'Distance',
    'shop.km': 'km',
    'shop.phone': 'Phone',
    'shop.email': 'Email',
    'shop.website': 'Website',
    'shop.address': 'Address',
    'shop.category': 'Category',
    'shop.description': 'Description',
    
    // Stats
    'stats.activeShops': 'Active Shops',
    'stats.happyCustomers': 'Happy Customers',
    'stats.citiesCovered': 'Cities Covered',
    
    // Footer
    'footer.copyright': '© 2024 8rupiya.com. All rights reserved.',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.viewAll': 'View All',
    'common.refresh': 'Refresh',
  },
  hi: {
    // Navbar
    'nav.login': 'लॉगिन',
    'nav.register': 'रजिस्टर',
    'nav.logout': 'लॉगआउट',
    'nav.adminDashboard': 'एडमिन डैशबोर्ड',
    'nav.userMenu': 'उपयोगकर्ता मेनू',
    
    // Hero Section
    'hero.searchPlaceholder': 'दुकानें, सेवाएं खोजें...',
    'hero.findShops': 'अपने पास की दुकानें खोजें',
    'hero.discover': 'अपने क्षेत्र में सर्वश्रेष्ठ स्थानीय व्यवसाय खोजें',
    
    // Categories
    'category.all': 'सभी श्रेणियां',
    'category.select': 'श्रेणी चुनें',
    
    // Shops
    'shop.featured': 'विशेष दुकानें',
    'shop.premium': 'प्रीमियम दुकानें',
    'shop.topRated': 'शीर्ष रेटेड दुकानें',
    'shop.nearby': 'पास की दुकानें',
    'shop.allShops': 'सभी दुकानें',
    'shop.in': 'में दुकानें',
    'shop.rating': 'रेटिंग',
    'shop.reviews': 'समीक्षाएं',
    'shop.distance': 'दूरी',
    'shop.km': 'किमी',
    'shop.phone': 'फोन',
    'shop.email': 'ईमेल',
    'shop.website': 'वेबसाइट',
    'shop.address': 'पता',
    'shop.category': 'श्रेणी',
    'shop.description': 'विवरण',
    
    // Stats
    'stats.activeShops': 'सक्रिय दुकानें',
    'stats.happyCustomers': 'खुश ग्राहक',
    'stats.citiesCovered': 'शहर कवर',
    
    // Footer
    'footer.copyright': '© 2024 8rupiya.com. सभी अधिकार सुरक्षित।',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.close': 'बंद करें',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    'common.viewAll': 'सभी देखें',
    'common.refresh': 'ताज़ा करें',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    }
  };

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

