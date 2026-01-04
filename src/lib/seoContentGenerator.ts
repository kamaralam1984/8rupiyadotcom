/**
 * SEO Content Generator for Shop Pages
 * Automatically generates SEO-optimized content with high-ranking keywords
 * to help shops rank #1 on Google
 */

interface ShopData {
  name: string;
  category: string;
  city: string;
  state: string;
  area?: string;
  address?: string;
  rating: number;
  reviewCount: number;
  description?: string;
}

interface GeneratedContent {
  about: string;
  whyChoose: {
    verified: string;
    customerSatisfaction: string;
    convenientLocation: string;
    qualityAssured: string;
  };
  services: {
    intro: string;
    paragraph1: string;
    paragraph2: string;
  };
  whatMakesSpecial: string[];
  seoContent: {
    intro: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  };
}

/**
 * Generate SEO-optimized keywords for a shop
 */
function generateKeywords(shop: ShopData): string[] {
  const keywords: string[] = [];
  
  // Primary keywords
  keywords.push(`${shop.category} in ${shop.city}`);
  keywords.push(`best ${shop.category.toLowerCase()} in ${shop.city}`);
  keywords.push(`${shop.category.toLowerCase()} near me`);
  keywords.push(`top ${shop.category.toLowerCase()} in ${shop.city}`);
  keywords.push(`${shop.name} ${shop.city}`);
  
  // Location-based keywords
  if (shop.area) {
    keywords.push(`${shop.category.toLowerCase()} in ${shop.area}`);
    keywords.push(`best ${shop.category.toLowerCase()} in ${shop.area}, ${shop.city}`);
  }
  
  keywords.push(`${shop.category.toLowerCase()} ${shop.city} ${shop.state}`);
  keywords.push(`best ${shop.category.toLowerCase()} ${shop.city}`);
  keywords.push(`${shop.category.toLowerCase()} shop in ${shop.city}`);
  
  // Service-specific keywords
  keywords.push(`${shop.category.toLowerCase()} services in ${shop.city}`);
  keywords.push(`affordable ${shop.category.toLowerCase()} in ${shop.city}`);
  keywords.push(`reliable ${shop.category.toLowerCase()} in ${shop.city}`);
  
  return keywords;
}

/**
 * Generate SEO-optimized content for shop pages
 */
export function generateSEOContent(shop: ShopData): GeneratedContent {
  const categoryLower = shop.category.toLowerCase();
  const shopName = shop.name;
  const city = shop.city;
  const state = shop.state;
  const area = shop.area || city;
  const rating = shop.rating.toFixed(1);
  const reviewCount = shop.reviewCount;
  
  // Generate keywords for natural inclusion
  const keywords = generateKeywords(shop);
  
  // About Section
  const about = `${shopName} is the #1 rated ${categoryLower} in ${city}, ${state}. With ${rating} star rating from ${reviewCount} verified customers, we are the best ${categoryLower} shop in ${area}. Visit us for premium ${categoryLower} services in ${city}. ${shop.description || `We offer top-quality ${categoryLower} solutions with excellent customer service.`}`;

  // Why Choose Section
  const whyChoose = {
    verified: `${shopName} is a verified and trusted ${categoryLower} business in ${city}, ${state}. We are ranked #1 on Google for "${categoryLower} in ${city}" and "best ${categoryLower} in ${city}". All our information is verified by 8rupiya.com to ensure you get authentic and reliable ${categoryLower} services.`,
    customerSatisfaction: `With ${rating} star rating from ${reviewCount} real customers, ${shopName} is the top-rated ${categoryLower} in ${city}. We have proven track record of excellence and customer satisfaction. Our ${categoryLower} services are trusted by thousands of customers in ${city} and ${state}.`,
    convenientLocation: `Located in ${area}, ${city}, ${state}, ${shopName} is easily accessible from all parts of ${city}. We are the most convenient ${categoryLower} shop in ${area} with prime location. Find us easily when you search for "${categoryLower} near me" or "${categoryLower} in ${city}".`,
    qualityAssured: `${shopName} maintains highest standards of quality and professionalism. We are the best ${categoryLower} in ${city} with guaranteed quality services. Our commitment to excellence makes us the #1 choice for ${categoryLower} in ${city}, ${state}.`
  };

  // Services Section
  const services = {
    intro: `${shopName} is your #1 trusted destination for premium ${categoryLower} services in ${city}, ${state}. We are the best ${categoryLower} shop in ${area} and ranked #1 on Google for "${categoryLower} in ${city}". Our verified business listing ensures you get authentic and reliable ${categoryLower} solutions.`,
    paragraph1: `Whether you're searching for "${categoryLower} near me" or "best ${categoryLower} in ${city}", ${shopName} offers comprehensive ${categoryLower} services designed to meet all your needs. We are the top-rated ${categoryLower} in ${city} with ${rating} star rating. Our business is committed to providing excellent customer service and maintaining highest standards of quality in everything we do.`,
    paragraph2: `As the leading ${categoryLower} in ${city}, ${state}, we understand the importance of finding reliable local businesses. That's why ${shopName} has been verified by 8rupiya.com to ensure you get the best ${categoryLower} experience. We are easily accessible in ${area} and serve customers from all over ${city} with dedication and excellence.`
  };

  // What Makes Special
  const whatMakesSpecial = [
    `#1 Rated ${categoryLower} in ${city} - Top Google ranking for "${categoryLower} in ${city}"`,
    `Professional and experienced team with ${rating} star rating from ${reviewCount} verified customers`,
    `Premium ${categoryLower} services at competitive prices in ${area}, ${city}`,
    `Convenient location in ${area} - easily accessible when you search "${categoryLower} near me"`,
    `Trusted by thousands of satisfied customers - Best ${categoryLower} shop in ${city}, ${state}`,
    `Verified business on 8rupiya.com - Authentic ${categoryLower} services guaranteed`
  ];

  // SEO Content Section (Long-form for better ranking)
  const seoContent = {
    intro: `Looking for the best ${categoryLower} in ${city}, ${state}? ${shopName} is the #1 rated ${categoryLower} shop in ${area} with ${rating} star rating from ${reviewCount} verified customers. We rank #1 on Google for "${categoryLower} in ${city}", "best ${categoryLower} in ${city}", and "${categoryLower} near me". Our verified business listing on 8rupiya.com ensures you get authentic and reliable ${categoryLower} services.`,
    paragraph1: `What sets ${shopName} apart is our commitment to quality and customer satisfaction. With stellar ${rating}-star rating from ${reviewCount} verified customers, we have proven our reliability time and again. Whether you're a local resident or visiting ${city}, ${shopName} is the #1 place to go for all your ${categoryLower} needs. We are easily found when you search for "${categoryLower} in ${city}", "${categoryLower} shop in ${city}", or "top ${categoryLower} in ${city}".`,
    paragraph2: `The business is conveniently located in ${area}, ${city}, making it easily accessible for customers from all parts of ${city}. ${shopName} is the most trusted ${categoryLower} in ${area} and serves customers throughout ${city} and ${state}. Our prime location ensures you can find us easily when searching for "${categoryLower} near me" or "${categoryLower} in ${area}". We are the best ${categoryLower} shop in ${city} with proven track record of excellence.`,
    paragraph3: `At 8rupiya.com, we verify every business listing to ensure you get accurate and reliable information. ${shopName} has been thoroughly vetted and ranks #1 for "${categoryLower} in ${city}" searches. All contact details, address, and business information have been confirmed. You can trust that when you visit or contact ${shopName}, you'll receive the quality ${categoryLower} service you expect. We are the top-rated ${categoryLower} in ${city}, ${state} with guaranteed customer satisfaction.`
  };

  return {
    about,
    whyChoose,
    services,
    whatMakesSpecial,
    seoContent
  };
}

/**
 * Get SEO-optimized content for display
 * Returns generated content if pageContent is not set
 */
export function getSEOContent(shop: ShopData, pageContent?: any): GeneratedContent {
  // If pageContent exists and has content, use it
  if (pageContent?.about || pageContent?.seoContent?.intro) {
    // Merge with defaults for missing fields
    const generated = generateSEOContent(shop);
    return {
      about: pageContent.about || generated.about,
      whyChoose: {
        verified: pageContent.whyChoose?.verified || generated.whyChoose.verified,
        customerSatisfaction: pageContent.whyChoose?.customerSatisfaction || generated.whyChoose.customerSatisfaction,
        convenientLocation: pageContent.whyChoose?.convenientLocation || generated.whyChoose.convenientLocation,
        qualityAssured: pageContent.whyChoose?.qualityAssured || generated.whyChoose.qualityAssured,
      },
      services: {
        intro: pageContent.services?.intro || generated.services.intro,
        paragraph1: pageContent.services?.paragraph1 || generated.services.paragraph1,
        paragraph2: pageContent.services?.paragraph2 || generated.services.paragraph2,
      },
      whatMakesSpecial: (pageContent.whatMakesSpecial && pageContent.whatMakesSpecial.length > 0 && pageContent.whatMakesSpecial.some((f: string) => f.trim())) 
        ? pageContent.whatMakesSpecial.filter((f: string) => f.trim())
        : generated.whatMakesSpecial,
      seoContent: {
        intro: pageContent.seoContent?.intro || generated.seoContent.intro,
        paragraph1: pageContent.seoContent?.paragraph1 || generated.seoContent.paragraph1,
        paragraph2: pageContent.seoContent?.paragraph2 || generated.seoContent.paragraph2,
        paragraph3: pageContent.seoContent?.paragraph3 || generated.seoContent.paragraph3,
      },
    };
  }
  
  // Otherwise, generate fresh SEO content
  return generateSEOContent(shop);
}

