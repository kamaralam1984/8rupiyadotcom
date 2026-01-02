import { Locale, defaultLocale } from './config';

export const translations: Record<Locale, Record<string, string>> = {
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
    'shop.allShops': 'All Shops',
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
    
    // CTA Section
    'cta.title': 'Start your local business journey!',
    'cta.description': 'Discover the best shops in your area or list your business - both are completely free!',
    'cta.exploreShops': 'Explore Shops',
    'cta.addBusiness': 'Add Your Business',
    
    // About Section
    'about.title': 'About 8rupiya.com',
    'about.subtitle': 'India\'s most trusted and fastest growing local business discovery platform',
    'about.whatIs': 'What is 8rupiya.com?',
    'about.whyChoose': 'Why choose 8rupiya.com?',
    'about.special': 'What makes 8rupiya.com special?',
    
    // Best Shops Section
    'shops.bestNearYou': 'Best Shops Near You',
    'shops.bestInCity': 'Best Shops in',
    'shops.explanation': '8rupiya.com helps users discover trusted nearby shops and services based on their location. From jewelry stores and furniture shops to doctors, teachers, and technicians, users can easily explore local businesses that are relevant to their daily needs. Our platform features verified businesses with accurate contact information, real customer reviews, and detailed profiles to help you make informed decisions. Whether you\'re looking for a specific product or service, our location-based search makes it simple to find the best options in your area.',
    
    // Text Break Sections
    'textBreak.howItWorks': 'How 8rupiya.com Works',
    'textBreak.howItWorksText': 'Our platform makes it easy to discover and connect with local businesses. Simply browse through verified shops, read authentic customer reviews, and contact businesses directly. All listings are verified for accuracy, ensuring you get reliable information every time.',
    'textBreak.findingRight': 'Finding the Right Business for You',
    'textBreak.findingRightText': 'Use our smart filters to narrow down your search by category, location, ratings, or specific services. Each business profile includes photos, contact details, operating hours, and customer reviews to help you make the best choice for your needs.',
    'textBreak.reviewsMatter': 'Why Reviews Matter',
    'textBreak.reviewsMatterText': 'Customer reviews and ratings help you understand the quality and reliability of local businesses. Our platform ensures all reviews are from verified users, giving you authentic insights to make better decisions when choosing shops and services in your area.',
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
    
    // CTA Section
    'cta.title': 'अपनी स्थानीय व्यापार यात्रा शुरू करें!',
    'cta.description': 'अपने क्षेत्र की सर्वश्रेष्ठ दुकानें खोजें या अपना व्यवसाय सूचीबद्ध करें - दोनों पूरी तरह से मुफ्त हैं!',
    'cta.exploreShops': 'दुकानें खोजें',
    'cta.addBusiness': 'अपना व्यवसाय जोड़ें',
    
    // About Section
    'about.title': '8rupiya.com के बारे में',
    'about.subtitle': 'भारत का सबसे भरोसेमंद और तेजी से बढ़ने वाला स्थानीय व्यवसाय खोज प्लेटफॉर्म',
    'about.whatIs': '8rupiya.com क्या है?',
    'about.whyChoose': '8rupiya.com क्यों चुनें?',
    'about.special': '8rupiya.com को खास क्या बनाता है?',
    
    // Best Shops Section
    'shops.bestNearYou': 'आपके पास की सर्वश्रेष्ठ दुकानें',
    'shops.bestInCity': 'में सर्वश्रेष्ठ दुकानें',
    'shops.explanation': '8rupiya.com उपयोगकर्ताओं को उनके स्थान के आधार पर भरोसेमंद पास की दुकानें और सेवाएं खोजने में मदद करता है। ज्वैलरी स्टोर और फर्नीचर की दुकानों से लेकर डॉक्टर, शिक्षक और तकनीशियन तक, उपयोगकर्ता आसानी से स्थानीय व्यवसायों का पता लगा सकते हैं जो उनकी दैनिक जरूरतों के लिए प्रासंगिक हैं। हमारा प्लेटफॉर्म सटीक संपर्क जानकारी, वास्तविक ग्राहक समीक्षाओं और विस्तृत प्रोफाइल के साथ सत्यापित व्यवसायों की सुविधा प्रदान करता है ताकि आप सूचित निर्णय ले सकें।',
    
    // Text Break Sections
    'textBreak.howItWorks': '8rupiya.com कैसे काम करता है',
    'textBreak.howItWorksText': 'हमारा प्लेटफॉर्म स्थानीय व्यवसायों को खोजने और उनसे जुड़ना आसान बनाता है। बस सत्यापित दुकानों के माध्यम से ब्राउज़ करें, प्रामाणिक ग्राहक समीक्षाएं पढ़ें, और व्यवसायों से सीधे संपर्क करें। सभी लिस्टिंग सटीकता के लिए सत्यापित हैं, यह सुनिश्चित करते हुए कि आपको हर बार विश्वसनीय जानकारी मिले।',
    'textBreak.findingRight': 'आपके लिए सही व्यवसाय खोजना',
    'textBreak.findingRightText': 'श्रेणी, स्थान, रेटिंग, या विशिष्ट सेवाओं द्वारा अपनी खोज को संकीर्ण करने के लिए हमारे स्मार्ट फ़िल्टर का उपयोग करें। प्रत्येक व्यवसाय प्रोफ़ाइल में फ़ोटो, संपर्क विवरण, काम के घंटे और ग्राहक समीक्षाएं शामिल हैं ताकि आप अपनी जरूरतों के लिए सबसे अच्छा विकल्प चुन सकें।',
    'textBreak.reviewsMatter': 'समीक्षाएं क्यों मायने रखती हैं',
    'textBreak.reviewsMatterText': 'ग्राहक समीक्षाएं और रेटिंग आपको स्थानीय व्यवसायों की गुणवत्ता और विश्वसनीयता को समझने में मदद करती हैं। हमारा प्लेटफॉर्म यह सुनिश्चित करता है कि सभी समीक्षाएं सत्यापित उपयोगकर्ताओं से हैं, जो आपको अपने क्षेत्र में दुकानों और सेवाओं को चुनते समय बेहतर निर्णय लेने के लिए प्रामाणिक अंतर्दृष्टि प्रदान करती हैं।',
  },
};

// Translation function
export function getTranslation(locale: Locale, key: string): string {
  const localeTranslations: Record<string, string> | undefined = translations[locale];
  const defaultTranslations: Record<string, string> = translations[defaultLocale];
  
  if (localeTranslations && key in localeTranslations) {
    return localeTranslations[key];
  }
  
  if (defaultTranslations && key in defaultTranslations) {
    return defaultTranslations[key];
  }
  
  return key;
}

