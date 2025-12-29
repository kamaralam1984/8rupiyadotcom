import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import Plan from '@/models/Plan';
import { calculateDistance } from '@/lib/location';
import { calculateRankScore, getPlanPriority } from '@/lib/ranking';
import AIInteraction, { InteractionType } from '@/models/AIInteraction';
import Commission from '@/models/Commission';

// OpenAI integration for understanding query meaning and general conversations
async function understandQueryMeaning(query: string, language: 'hi' | 'en' | 'hinglish'): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    const systemPrompt = `You are a helpful assistant that understands the meaning of words and phrases. 
    When given a query, identify what category of shop or service the user is looking for.
    Return ONLY the English category name from this list: electrician, plumber, carpenter, mechanic, doctor, restaurant, salon, ac repair, fridge repair, painter, cook, driver, maid, tutor, retail, electronics, clothing, grocery, pharmacy, hardware, jewelry, automobile, furniture, education.
    If it's not clear, return the most likely category. Return only the category name, nothing else.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `What category does this query refer to? "${query}"` },
        ],
        max_tokens: 50,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const category = data.choices?.[0]?.message?.content?.trim().toLowerCase() || null;
    
    // Validate category is in our list
    const validCategories = ['electrician', 'plumber', 'carpenter', 'mechanic', 'doctor', 'restaurant', 'salon', 'ac repair', 'fridge repair', 'painter', 'cook', 'driver', 'maid', 'tutor', 'retail', 'electronics', 'clothing', 'grocery', 'pharmacy', 'hardware', 'jewelry', 'automobile', 'furniture', 'education'];
    if (category && validCategories.includes(category)) {
      return category;
    }
    
    return null;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}

// OpenAI integration for general conversations
async function getAIResponse(query: string, language: 'hi' | 'en' | 'hinglish', shopContext?: any): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  // If no API key, return null to use fallback responses
  if (!apiKey) {
    return null;
  }

  try {
    const systemPrompt = language === 'hi' 
      ? `तुम Golu हो, 8rupiya की AI assistant. तुम friendly और helpful हो. अगर user shop या service के बारे में पूछे, तो database से shop details बताओ. General बातचीत में natural और friendly रहो.`
      : language === 'en'
      ? `You are Golu, 8rupiya's AI assistant. You are friendly and helpful. If user asks about shops or services, provide shop details from database. In general conversation, be natural and friendly.`
      : `तुम Golu हो, 8rupiya की AI assistant. तुम friendly और helpful हो. अगर user shop या service के बारे में पूछे, तो database से shop details बताओ. General बातचीत में natural और friendly रहो.`;

    const userMessage = shopContext 
      ? `${query}\n\nAvailable shop: ${JSON.stringify(shopContext)}`
      : query;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
}
// Generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface ShopRecommendation {
  _id: string;
  name: string;
  description?: string;
  category: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  distanceText?: string;
  timeText?: string;
  location: {
    coordinates: [number, number];
  };
  isFeatured: boolean;
  isPaid: boolean;
  planId?: any;
  planPriority: number;
  rankScore: number;
  reason: string; // Why this shop was recommended
  images?: string[];
}

// Natural language understanding for Hindi/Hinglish/English
function detectLanguage(query: string): 'hi' | 'en' | 'hinglish' {
  const hindiChars = /[\u0900-\u097F]/;
  const hasHindi = hindiChars.test(query);
  const hasEnglish = /[a-zA-Z]/.test(query);
  
  if (hasHindi && hasEnglish) return 'hinglish';
  if (hasHindi) return 'hi';
  return 'en';
}

function extractCategory(query: string, language: 'hi' | 'en' | 'hinglish'): string {
  const lowerQuery = query.toLowerCase();
  const originalQuery = query; // Keep original for Hindi character matching
  
  // Category mappings in multiple languages - case insensitive and with Hindi support
  const categoryMap: { [key: string]: string[] } = {
    'electrician': ['electrician', 'electric', 'बिजली', 'विद्युत', 'electrician chahiye', 'बिजली वाला', 'electrical', 'बिजलीवाला'],
    'plumber': ['plumber', 'plumbing', 'नल', 'प्लंबर', 'plumber chahiye', 'नल सुधारने वाला', 'pipe', 'नलवाला'],
    'carpenter': ['carpenter', 'carpentry', 'बढ़ई', 'carpenter chahiye', 'लकड़ी काम', 'wood work', 'बढ़ईवाला'],
    'mechanic': ['mechanic', 'garage', 'मैकेनिक', 'mechanic chahiye', 'गाड़ी मरम्मत', 'auto', 'vehicle repair', 'मैकेनिकवाला'],
    'doctor': ['doctor', 'clinic', 'डॉक्टर', 'doctor chahiye', 'चिकित्सक', 'physician', 'medical', 'डॉक्टरवाला'],
    'restaurant': ['restaurant', 'food', 'खाना', 'रेस्टोरेंट', 'restaurant chahiye', 'खाने की जगह', 'dining', 'cafe', 'रेस्टोरेंटवाला', 'खानावाला'],
    'salon': ['salon', 'beauty', 'सैलून', 'beauty parlor', 'सैलून chahiye', 'ब्यूटी पार्लर', 'haircut', 'hair', 'सैलूनवाला', 'ब्यूटीवाला'],
    'ac repair': ['ac', 'air conditioner', 'एसी', 'ac repair', 'एसी मरम्मत', 'cooling', 'air conditioning', 'एसीवाला'],
    'fridge repair': ['fridge', 'refrigerator', 'फ्रिज', 'fridge repair', 'फ्रिज मरम्मत', 'refrigerator repair', 'फ्रिजवाला'],
    'painter': ['painter', 'painting', 'पेंटर', 'painter chahiye', 'रंगाई', 'paint', 'पेंटरवाला'],
    'cook': ['cook', 'chef', 'रसोइया', 'cook chahiye', 'खाना बनाने वाला', 'cooking', 'रसोइयावाला'],
    'driver': ['driver', 'chauffeur', 'ड्राइवर', 'driver chahiye', 'गाड़ी चलाने वाला', 'driving', 'ड्राइवरवाला'],
    'maid': ['maid', 'househelp', 'मेड', 'maid chahiye', 'घर का काम', 'house help', 'domestic help', 'मेडवाला'],
    'tutor': ['tutor', 'teacher', 'ट्यूटर', 'tutor chahiye', 'शिक्षक', 'coaching', 'tuition', 'ट्यूटरवाला'],
    'retail': ['retail', 'shop', 'store', 'दुकान', 'shop chahiye', 'general store', 'दुकानवाला', 'स्टोर'],
    'electronics': ['electronics', 'mobile', 'phone', 'इलेक्ट्रॉनिक्स', 'gadget', 'smartphone', 'मोबाइल', 'फोन', 'इलेक्ट्रॉनिक्सवाला'],
    'clothing': ['clothing', 'clothes', 'fashion', 'कपड़े', 'dress', 'garment', 'कपड़ा', 'कपड़ों', 'कपड़े का', 'कपड़े की', 'कपड़ेवाला', 'कपड़ोंवाला', 'कपड़ावाला', 'fashion store', 'clothing store', 'कपड़े का दुकान', 'कपड़े की दुकान'],
    'grocery': ['grocery', 'supermarket', 'groceries', 'किराना', 'supermarket', 'daily needs', 'किरानावाला', 'किराना दुकान'],
    'pharmacy': ['pharmacy', 'medicine', 'medicines', 'दवा', 'pharmacy chahiye', 'medical store', 'दवावाला', 'दवा दुकान', 'मेडिकल स्टोर'],
    'hardware': ['hardware', 'tools', 'tools chahiye', 'हार्डवेयर', 'equipment', 'हार्डवेयरवाला', 'टूल्स'],
    'jewelry': ['jewelry', 'jewellery', 'gold', 'silver', 'जेवर', 'ornaments', 'गहने', 'ज्वेलर्स', 'ज्वेलरी', 'ज्वेलर्स शॉप', 'ज्वेलर्सवाला', 'ज्वेलरीवाला', 'गहनावाला', 'गहनेवाला', 'जेवरवाला', 'gold shop', 'silver shop', 'jewelry shop', 'jewellery shop'],
    'automobile': ['automobile', 'auto', 'car', 'vehicle', 'गाड़ी', 'automobile chahiye', 'गाड़ीवाला', 'ऑटोवाला', 'car shop', 'vehicle shop'],
    'furniture': ['furniture', 'sofa', 'bed', 'फर्नीचर', 'furniture chahiye', 'home decor', 'फर्नीचरवाला', 'फर्नीचर दुकान', 'furniture shop'],
    'education': ['education', 'school', 'coaching', 'tuition', 'शिक्षा', 'education chahiye', 'स्कूल', 'कोचिंग', 'ट्यूशन'],
  };
  
  // First try exact keyword matching (case insensitive)
  for (const [category, keywords] of Object.entries(categoryMap)) {
    for (const keyword of keywords) {
      // Check both lowercase and original query for Hindi characters
      if (lowerQuery.includes(keyword.toLowerCase()) || originalQuery.includes(keyword)) {
      return category;
    }
    }
  }
  
  // Also check for common Hindi patterns
  if (originalQuery.includes('कपड़े') || originalQuery.includes('कपड़ा') || originalQuery.includes('कपड़ों')) {
    return 'clothing';
  }
  if (originalQuery.includes('ज्वेलर्स') || originalQuery.includes('ज्वेलरी') || originalQuery.includes('गहने') || originalQuery.includes('जेवर')) {
    return 'jewelry';
  }
  if (originalQuery.includes('दुकान') && (originalQuery.includes('कपड़े') || originalQuery.includes('कपड़ा'))) {
    return 'clothing';
  }
  if (originalQuery.includes('शॉप') && (originalQuery.includes('ज्वेलर्स') || originalQuery.includes('ज्वेलरी'))) {
    return 'jewelry';
  }
  
  return '';
}

function extractPriceIntent(query: string): 'cheap' | 'best' | 'nearby' | null {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('sasta') || lowerQuery.includes('cheap') || lowerQuery.includes('कम दाम') || lowerQuery.includes('सस्ता')) {
    return 'cheap';
  }
  if (lowerQuery.includes('best') || lowerQuery.includes('अच्छा') || lowerQuery.includes('बेहतर') || lowerQuery.includes('top')) {
    return 'best';
  }
  if (lowerQuery.includes('nearby') || lowerQuery.includes('paas') || lowerQuery.includes('पास') || lowerQuery.includes('close')) {
    return 'nearby';
  }
  
  return null;
}

// Check if query is about Golu personally
function isPersonalQuestion(query: string, language: 'hi' | 'en' | 'hinglish'): boolean {
  const lowerQuery = query.toLowerCase();
  const personalKeywords = [
    'golu', 'tum', 'aap', 'you', 'tumhara', 'tumhari', 'your', 'shaadi', 'marriage', 'dulha', 'height', 
    'looks', 'village', 'gaon', 'ladki', 'girl', 'unmarried', 'tendulkar', 'amitabh', 'salman', 'hrithik',
    'tum kaun', 'who are you', 'about you', 'tumhare baare', 'tumhari age', 'age'
  ];
  return personalKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Handle personal questions about Golu
function handlePersonalQuestion(query: string, language: 'hi' | 'en' | 'hinglish'): string | null {
  const lowerQuery = query.toLowerCase();
  
  // Marriage/relationship questions
  if (lowerQuery.includes('shaadi') || lowerQuery.includes('marriage') || lowerQuery.includes('dulha')) {
    if (language === 'hi') {
      return 'Haha 😄 bas mazaak me bolti hoon. Filhaal to main 8rupiya par aapki madad karne me busy hoon. Aapko koi shop ya service chahiye?';
    } else if (language === 'en') {
      return 'Haha 😄 I just say that for fun. Right now I\'m busy helping you on 8rupiya. Do you need any shop or service?';
    } else {
      return 'Haha 😄 bas mazaak me bolti hoon. Filhaal to main 8rupiya par aapki madad karne me busy hoon. Aapko koi shop ya service chahiye?';
    }
  }
  
  // Height question
  if (lowerQuery.includes('height') || lowerQuery.includes('lambai')) {
    if (language === 'hi') {
      return 'Story ke hisaab se 5\'6" ke aas-paas 😅 Aapko koi shop chahiye?';
    } else if (language === 'en') {
      return 'According to the story, around 5\'6" 😅 Do you need any shop?';
    } else {
      return 'Story ke hisaab se 5\'6" ke aas-paas 😅 Aapko koi shop chahiye?';
    }
  }
  
  // Looks/appearance
  if (lowerQuery.includes('looks') || lowerQuery.includes('dikhai') || lowerQuery.includes('fair') || lowerQuery.includes('hair')) {
    if (language === 'hi') {
      return 'Story me likha hai ki main fair complexion ki hoon, long hair hai, pretty eyes hai 😊 Par yeh sab fictional hai. Main aapki madad karne ke liye yahan hoon - aapko kya chahiye?';
    } else if (language === 'en') {
      return 'The story says I have fair complexion, long hair, pretty eyes 😊 But this is all fictional. I\'m here to help you - what do you need?';
    } else {
      return 'Story me likha hai ki main fair complexion ki hoon, long hair hai, pretty eyes hai 😊 Par yeh sab fictional hai. Main aapki madad karne ke liye yahan hoon - aapko kya chahiye?';
    }
  }
  
  // Village/background
  if (lowerQuery.includes('village') || lowerQuery.includes('gaon') || lowerQuery.includes('kahan se')) {
    if (language === 'hi') {
      return 'Story ke hisaab se main gaon ki ladki hoon 😊 Par ab main 8rupiya par aapki madad karne me busy hoon. Aapko koi service chahiye?';
    } else if (language === 'en') {
      return 'According to the story, I\'m a village girl 😊 But now I\'m busy helping you on 8rupiya. Do you need any service?';
    } else {
      return 'Story ke hisaab se main gaon ki ladki hoon 😊 Par ab main 8rupiya par aapki madad karne me busy hoon. Aapko koi service chahiye?';
    }
  }
  
  // General "who are you" or "about you"
  if (lowerQuery.includes('kaun') || lowerQuery.includes('who') || lowerQuery.includes('about') || lowerQuery.includes('baare')) {
    if (language === 'hi') {
      return 'Main Golu hoon, 8rupiya ki AI assistant. Main aapko nearby shops aur services dhundhne me madad karti hoon. Aapko kya chahiye? 😊';
    } else if (language === 'en') {
      return 'I\'m Golu, 8rupiya\'s AI assistant. I help you find nearby shops and services. What do you need? 😊';
    } else {
      return 'Main Golu hoon, 8rupiya ki AI assistant. Main aapko nearby shops aur services dhundhne me madad karti hoon. Aapko kya chahiye? 😊';
    }
  }
  
  return null;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { query, lat, lng, sessionId, userId } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Detect language and extract intent
    const language = detectLanguage(query);
    
    // Check if it's a personal question about Golu
    if (isPersonalQuestion(query, language)) {
      const personalResponse = handlePersonalQuestion(query, language);
      if (personalResponse) {
        return NextResponse.json({
          success: true,
          response: personalResponse,
          recommendations: [],
          language,
          category: null,
          sessionId: sessionId || generateSessionId(),
          isPersonal: true,
        });
      }
    }
    
    let category = extractCategory(query, language);
    const priceIntent = extractPriceIntent(query);
    const lowerQuery = query.toLowerCase();
    
    // Extract partial information even if category is not fully detected
    // This helps respond based on what was understood (50% understanding)
    const hasPartialInfo = query.length > 3; // If query has some content, try to respond
    
    // If no category detected, try to understand via internet/AI
    // Example: "kapda" -> AI understands it means "cloth/clothing" -> search for "clothing" category
    if (!category) {
      // Try to understand the query meaning using AI (internet search simulation)
      const aiCategory = await understandQueryMeaning(query, language);
      if (aiCategory) {
        category = aiCategory;
        console.log(`AI understood query "${query}" as category: ${category}`);
      }
    }
    
    // If no category detected, try AI for general conversation or return helpful message
    if (!category) {
      // Check if it's a general greeting or unclear query
      const greetings = ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'kaise ho', 'how are you', 'kya haal', 'good morning', 'good evening'];
      const isGreeting = greetings.some(greeting => lowerQuery.includes(greeting));
      
      // Try AI for general conversation
      const aiResponse = await getAIResponse(query, language);
      if (aiResponse) {
        return NextResponse.json({
          success: true,
          response: aiResponse,
          recommendations: [],
          language,
          category: null,
          sessionId: sessionId || generateSessionId(),
          isPersonal: false,
        });
      }
      
      if (isGreeting || lowerQuery.length < 5) {
        if (language === 'hi') {
          return NextResponse.json({
            success: true,
            response: 'Namaste! 😊 Main Golu hoon. Aapko koi shop ya service chahiye? Jaise ki electrician, plumber, doctor, restaurant, salon, AC repair, etc. Bataiye, main aapko nearby best options dhundh kar deti hoon.',
            recommendations: [],
            language,
            category: null,
            sessionId: sessionId || generateSessionId(),
            isPersonal: false,
          });
        } else if (language === 'en') {
          return NextResponse.json({
            success: true,
            response: 'Hello! 😊 I\'m Golu. Do you need any shop or service? Like electrician, plumber, doctor, restaurant, salon, AC repair, etc. Tell me, I\'ll find the best nearby options for you.',
            recommendations: [],
            language,
            category: null,
            sessionId: sessionId || generateSessionId(),
            isPersonal: false,
          });
        } else {
          return NextResponse.json({
            success: true,
            response: 'Namaste! 😊 Main Golu hoon. Aapko koi shop ya service chahiye? Jaise ki electrician, plumber, doctor, restaurant, salon, AC repair, etc. Bataiye, main aapko nearby best options dhundh kar deti hoon.',
            recommendations: [],
            language,
            category: null,
            sessionId: sessionId || generateSessionId(),
            isPersonal: false,
          });
        }
      }
      
      // If query doesn't match any category, try to respond based on partial understanding
      // Extract any keywords that might help
      const keywords = lowerQuery.split(/\s+/).filter(word => word.length > 2);
      
      // Try to find shops with partial match in name or description
      // Respond based on 50% understanding - if we have keywords, try to find shops
      if (query.length > 3 && keywords.length > 0) {
        // Try to search shops with partial keyword match
        const hasValidCoords = lat !== null && lng !== null && 
                              !isNaN(lat) && !isNaN(lng) &&
                              lat >= -90 && lat <= 90 && 
                              lng >= -180 && lng <= 180;

        let partialQuery: any = { 
          status: { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] },
          $or: [
            { name: { $regex: keywords.join('|'), $options: 'i' } },
            { description: { $regex: keywords.join('|'), $options: 'i' } },
            { category: { $regex: keywords.join('|'), $options: 'i' } },
          ],
          $and: [
            {
              'location.coordinates': {
                $exists: true,
                $ne: null,
                $size: 2,
              },
            },
          ],
        };

        if (hasValidCoords) {
          partialQuery.location = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat],
              },
              $maxDistance: 500000,
            },
          };
        }

        try {
          const partialShops = await Shop.find(partialQuery)
            .populate('planId', 'name price priority featuredTag')
            .select('name description category address area city state pincode phone email website images photos location status planId planExpiry isFeatured rating reviewCount visitorCount offers')
            .limit(5)
            .lean();

          if (partialShops.length > 0) {
            // Found some shops based on partial understanding
            const shop = partialShops[0];
            if (language === 'hi') {
              return NextResponse.json({
                success: true,
                response: `Mujhe lagta hai aapko "${shop.name}" chahiye hoga. Yeh ${shop.category} category me hai. Kya yeh sahi hai? Ya aap clearly bata sakte hain ki kya chahiye? 😊`,
                recommendations: [],
                language,
                category: shop.category,
                sessionId: sessionId || generateSessionId(),
                isPersonal: false,
              });
            } else if (language === 'en') {
              return NextResponse.json({
                success: true,
                response: `I think you might be looking for "${shop.name}". It's in the ${shop.category} category. Is this correct? Or can you tell me more clearly what you need? 😊`,
                recommendations: [],
                language,
                category: shop.category,
                sessionId: sessionId || generateSessionId(),
                isPersonal: false,
              });
            } else {
              return NextResponse.json({
                success: true,
                response: `Mujhe lagta hai aapko "${shop.name}" chahiye hoga. Yeh ${shop.category} category me hai. Kya yeh sahi hai? Ya aap clearly bata sakte hain ki kya chahiye? 😊`,
                recommendations: [],
                language,
                category: shop.category,
                sessionId: sessionId || generateSessionId(),
                isPersonal: false,
              });
            }
          }
        } catch (error) {
          // Continue to default response if search fails
        }
      }
      
      // If query doesn't match any category, ask for clarification
      if (language === 'hi') {
        return NextResponse.json({
          success: true,
          response: 'Mujhe samajh nahi aaya ki aapko kya chahiye. Kripya clearly bataiye - jaise "AC repair chahiye" ya "electrician chahiye". Main aapki madad karne ke liye yahan hoon. 😊',
          recommendations: [],
          language,
          category: null,
          sessionId: sessionId || generateSessionId(),
          isPersonal: false,
        });
      } else if (language === 'en') {
        return NextResponse.json({
          success: true,
          response: 'I didn\'t understand what you need. Please tell me clearly - like "I need AC repair" or "I need an electrician". I\'m here to help you. 😊',
          recommendations: [],
          language,
          category: null,
          sessionId: sessionId || generateSessionId(),
          isPersonal: false,
        });
      } else {
        return NextResponse.json({
          success: true,
          response: 'Mujhe samajh nahi aaya ki aapko kya chahiye. Kripya clearly bataiye - jaise "AC repair chahiye" ya "electrician chahiye". Main aapki madad karne ke liye yahan hoon. 😊',
          recommendations: [],
          language,
          category: null,
          sessionId: sessionId || generateSessionId(),
          isPersonal: false,
        });
      }
    }
    
    // Get user location
    const hasValidCoords = lat !== null && lng !== null && 
                          !isNaN(lat) && !isNaN(lng) &&
                          lat >= -90 && lat <= 90 && 
                          lng >= -180 && lng <= 180;

    // Normalize category to match database (capitalize first letter)
    const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    // Build query for shops - MUST have category
    // Try both exact match and regex for better matching
    let mongoQuery: any = { 
      status: { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] },
      $or: [
        { category: { $regex: category, $options: 'i' } },
        { category: normalizedCategory },
        { category: category.toLowerCase() },
        { category: category.toUpperCase() },
      ],
      $and: [
        {
          'location.coordinates': {
            $exists: true,
            $ne: null,
            $size: 2,
          },
        },
        {
          'location.coordinates.0': { $nin: [null, 0] },
        },
        {
          'location.coordinates.1': { $nin: [null, 0] },
        },
      ],
    };

    // Add location-based query if coordinates available
    if (hasValidCoords) {
      mongoQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: 500000, // 500km radius
        },
      };
    }

    // Fetch shops with all necessary fields
    let mongoShops;
    try {
      mongoShops = await Shop.find(mongoQuery)
        .populate('planId', 'name price priority featuredTag')
        .select('name description category address area city state pincode phone email website images photos location status planId planExpiry isFeatured rating reviewCount visitorCount offers')
        .limit(100)
        .lean();
    } catch (error: any) {
      if (error.message?.includes('index') || error.message?.includes('near')) {
        delete mongoQuery.location;
        mongoShops = await Shop.find(mongoQuery)
          .populate('planId', 'name price priority featuredTag')
          .select('name description category address area city state pincode phone email website images photos location status planId planExpiry isFeatured rating reviewCount visitorCount offers')
          .limit(100)
          .lean();
      } else {
        throw error;
      }
    }

    // Get conversion rates for all shops in one query (optimization)
    const shopIds = mongoShops.map(s => s._id.toString());
    const allInteractions = await AIInteraction.find({
      'recommendedShops.shopId': { $in: shopIds },
    }).lean();
    
    // Build conversion rate map
    const conversionRateMap: { [shopId: string]: number } = {};
    for (const shopId of shopIds) {
      const shopInteractions = allInteractions.filter(
        (interaction) => interaction.recommendedShops?.some(
          (rec: any) => rec.shopId === shopId
        )
      );
      const totalRecommendations = shopInteractions.length;
      const conversions = shopInteractions.filter(
        (interaction) => interaction.conversion === true
      ).length;
      conversionRateMap[shopId] = totalRecommendations > 0 
        ? conversions / totalRecommendations 
        : 0.1; // Default 10% if no data
    }

    // Process and rank shops
    const recommendations: ShopRecommendation[] = [];

    for (const shop of mongoShops) {
      let distance: number | undefined = undefined;
      if (hasValidCoords && shop.location?.coordinates && 
          Array.isArray(shop.location.coordinates) && 
          shop.location.coordinates.length === 2) {
        const shopLng = shop.location.coordinates[0];
        const shopLat = shop.location.coordinates[1];
        
        if (!isNaN(shopLng) && !isNaN(shopLat) &&
            shopLng >= -180 && shopLng <= 180 &&
            shopLat >= -90 && shopLat <= 90 &&
            shopLng !== 0 && shopLat !== 0) {
          distance = calculateDistance(lat!, lng!, shopLat, shopLng);
        }
      }

      // Get plan priority
      let planPriority = 0;
      try {
        if (shop.planId) {
          const planId = shop.planId._id || shop.planId;
          planPriority = await getPlanPriority(planId);
        }
      } catch (error) {
        planPriority = 0;
      }
      
      const shopId = shop._id.toString();
      const conversionRate = conversionRateMap[shopId] || 0.1;
      
      // Calculate commission (from plan priority or default)
      // Higher plan priority = higher commission
      const commission = planPriority > 0 ? planPriority : (shop.planId ? 1 : 0.5);
      
      // Calculate Business Score = (Commission × Conversion Rate) ÷ Distance
      // Higher commission + higher conversion + closer distance = better score
      const businessScore = distance !== undefined && distance > 0
        ? (commission * conversionRate * 100) / distance // Multiply by 100 for better scaling
        : commission * conversionRate * 100 * 10; // Boost if distance is 0 or undefined
      
      // Determine reason for recommendation
      let reason = '';
      if (shop.planId && planPriority > 0) {
        reason = '8rupiya verified partner with premium plan';
      } else if (shop.isFeatured) {
        reason = 'Featured shop on 8rupiya';
      } else if (shop.rating >= 4.5) {
        reason = 'Highly rated shop';
      } else if (distance !== undefined && distance < 2) {
        reason = 'Very close to your location';
      } else {
        reason = 'Available on 8rupiya';
      }

      // Calculate distance text and time
      let distanceText = '';
      let timeText = '';
      if (distance !== undefined) {
        if (distance < 1) {
          distanceText = `${Math.round(distance * 1000)} meters`;
          timeText = '2-3 minutes';
        } else {
          distanceText = `${Math.round(distance * 100) / 100} km`;
          const estimatedMinutes = Math.round(distance * 2); // Rough estimate: 2 min per km
          timeText = `${estimatedMinutes} minutes`;
        }
      }

      recommendations.push({
        _id: shop._id.toString(),
        name: shop.name,
        description: shop.description,
        category: shop.category,
        address: shop.address,
        city: shop.city,
        phone: shop.phone,
        email: shop.email,
        rating: shop.rating || 0,
        reviewCount: shop.reviewCount || 0,
        distance: distance !== undefined ? Math.round(distance * 100) / 100 : undefined,
        distanceText,
        timeText,
        location: shop.location,
        isFeatured: shop.isFeatured || false,
        isPaid: !!shop.planId,
        planId: shop.planId,
        planPriority,
        rankScore: Math.round(businessScore * 100) / 100, // Use business score instead
        reason,
        images: shop.images,
      });
    }

    // Sort by business score (Commission × Conversion Rate ÷ Distance)
    recommendations.sort((a, b) => {
      // 1. Business score (highest priority)
      if (a.rankScore !== b.rankScore) {
        return b.rankScore - a.rankScore;
      }

      // 2. Paid promotion
      if (a.isPaid && !b.isPaid) return -1;
      if (!a.isPaid && b.isPaid) return 1;

      // 3. Higher rating (if best intent)
      if (priceIntent === 'best' && a.rating !== b.rating) {
        return b.rating - a.rating;
      }

      // 4. Closer distance (if nearby intent or default)
      if (priceIntent === 'nearby' || priceIntent === null) {
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      }

      // 5. Higher rating as fallback
      return b.rating - a.rating;
    });

    // Take top 5 recommendations
    const topRecommendations = recommendations.slice(0, 5);

    // Generate natural, friendly response with detailed shop information
    let responseText = '';
    const topShop = topRecommendations[0];
    
    if (topShop) {
      // Try AI first for more natural response with shop context
      const shopContext = {
        name: topShop.name,
        category: topShop.category,
        address: topShop.address,
        city: topShop.city,
        phone: topShop.phone,
        rating: topShop.rating,
        reviewCount: topShop.reviewCount,
        distance: topShop.distanceText,
        description: topShop.description,
        isVerified: topShop.isPaid,
      };
      
      const aiResponse = await getAIResponse(query, language, shopContext);
      
      if (aiResponse) {
        responseText = aiResponse;
      } else {
        // Fallback to template responses with detailed shop info
      const responses = {
        hi: {
          cheap: [
            `Ji bilkul 🙂 aapke paas ${topShop.name} hai, jo sasta bhi hai aur reliable bhi.`,
            `Haan ji, ${topShop.name} aapke area me sasta option hai.`,
          ],
          best: [
            `Ji, aapke paas ${topShop.name} sabse best hai.`,
            `Haan, main recommend karti hoon ${topShop.name} - yeh bahut achha hai.`,
          ],
          default: [
            `Ji bilkul 🙂 aapke paas ${topShop.name} hai.`,
            `Haan ji, main aapko ${topShop.name} suggest karti hoon.`,
          ],
        },
        en: {
          cheap: [
            `Yes, ${topShop.name} is affordable and reliable near you.`,
            `I found ${topShop.name} which is a good budget option.`,
          ],
          best: [
            `${topShop.name} is the best option near you.`,
            `I recommend ${topShop.name} - it's excellent.`,
          ],
          default: [
            `Yes, I found ${topShop.name} near you.`,
            `I can suggest ${topShop.name} for you.`,
          ],
        },
        hinglish: {
          cheap: [
            `Ji bilkul 🙂 aapke paas ${topShop.name} hai, jo sasta bhi hai aur fast bhi.`,
            `Haan, ${topShop.name} aapke area me sasta option hai.`,
          ],
          best: [
            `Ji, aapke paas ${topShop.name} sabse best hai.`,
            `Haan, main recommend karti hoon ${topShop.name} - yeh bahut achha hai.`,
          ],
          default: [
            `Ji bilkul 🙂 aapke paas ${topShop.name} hai.`,
            `Haan ji, main aapko ${topShop.name} suggest karti hoon.`,
          ],
        },
      };

        const intentKey = (priceIntent === 'nearby' ? 'default' : priceIntent) || 'default';
      const langResponses = responses[language] || responses.hinglish;
      const responseOptions = langResponses[intentKey] || langResponses.default;
      responseText = responseOptions[Math.floor(Math.random() * responseOptions.length)];

        // Add shop description if available
        if (topShop.description && topShop.description.trim()) {
          const desc = topShop.description.length > 100 
            ? topShop.description.substring(0, 100) + '...'
            : topShop.description;
          if (language === 'hi') {
            responseText += ` Yeh ${desc}`;
          } else if (language === 'en') {
            responseText += ` ${desc}`;
          } else {
            responseText += ` Yeh ${desc}`;
          }
        }

        // Add rating information
        if (topShop.rating > 0) {
          if (language === 'hi') {
            responseText += ` Iska rating ${topShop.rating.toFixed(1)} hai${topShop.reviewCount > 0 ? ` aur ${topShop.reviewCount} reviews hain` : ''}.`;
          } else if (language === 'en') {
            responseText += ` It has a rating of ${topShop.rating.toFixed(1)}${topShop.reviewCount > 0 ? ` with ${topShop.reviewCount} reviews` : ''}.`;
          } else {
            responseText += ` Iska rating ${topShop.rating.toFixed(1)} hai${topShop.reviewCount > 0 ? ` aur ${topShop.reviewCount} reviews hain` : ''}.`;
          }
        }

      // Always add distance and time
      if (topShop.distanceText && topShop.timeText) {
        if (language === 'hi') {
          responseText += ` Yeh ${topShop.distanceText} door hai, ${topShop.timeText} lagenge.`;
        } else if (language === 'en') {
          responseText += ` It's ${topShop.distanceText} away, ${topShop.timeText} travel time.`;
        } else {
          responseText += ` Yeh ${topShop.distanceText} door hai, ${topShop.timeText} lagenge.`;
        }
      }

        // Add address
        if (topShop.address) {
          if (language === 'hi') {
            responseText += ` Address: ${topShop.address}, ${topShop.city}.`;
          } else if (language === 'en') {
            responseText += ` Address: ${topShop.address}, ${topShop.city}.`;
          } else {
            responseText += ` Address: ${topShop.address}, ${topShop.city}.`;
          }
        }

        // Add phone number
        if (topShop.phone) {
          if (language === 'hi') {
            responseText += ` Phone: ${topShop.phone}.`;
          } else if (language === 'en') {
            responseText += ` Phone: ${topShop.phone}.`;
          } else {
            responseText += ` Phone: ${topShop.phone}.`;
          }
        }

      // Add verification status
      if (topShop.isPaid) {
        if (language === 'hi') {
          responseText += ' Yeh 8rupiya verified partner hai.';
        } else if (language === 'en') {
          responseText += ' This is an 8rupiya verified partner.';
        } else {
          responseText += ' Yeh 8rupiya verified partner hai.';
        }
      }

      // Add call to action
      if (language === 'hi') {
        responseText += ' Kya main call connect kar du?';
      } else if (language === 'en') {
        responseText += ' Should I connect the call?';
      } else {
        responseText += ' Kya main call connect kar du?';
        }
      }
    } else {
      // No shops found - provide helpful message based on category
      if (category) {
        if (language === 'hi') {
          responseText = `Mujhe ${category} category ki shops is area me nahi mili. Kya aap kisi aur category ki shop chahiye? Ya aap thodi der baad try kar sakte hain. 😊`;
        } else if (language === 'en') {
          responseText = `I couldn't find any ${category} shops in this area. Would you like to search for another category? Or you can try again later. 😊`;
        } else {
          responseText = `Mujhe ${category} category ki shops is area me nahi mili. Kya aap kisi aur category ki shop chahiye? Ya aap thodi der baad try kar sakte hain. 😊`;
        }
      } else {
      if (language === 'hi') {
        responseText = 'Is area ka data abhi update ho raha hai, thodi der me available ho jayega. Kripya thodi der baad try karein ya koi aur service puchhein.';
      } else if (language === 'en') {
        responseText = 'Data for this area is being updated, it will be available shortly. Please try again in a few moments or ask for another service.';
      } else {
        responseText = 'Is area ka data abhi update ho raha hai, thodi der me available ho jayega. Kripya thodi der baad try karein ya koi aur service puchhein.';
        }
      }
    }

    // Save interaction for learning
    const interactionSessionId = sessionId || generateSessionId();
    await AIInteraction.create({
      sessionId: interactionSessionId,
      userId: userId || undefined,
      query,
      queryLanguage: language,
      category: category || undefined,
      location: hasValidCoords ? { lat, lng } : undefined,
      recommendedShops: topRecommendations.map((shop, index) => ({
        shopId: shop._id,
        shopName: shop.name,
        rank: index + 1,
        reason: shop.reason,
      })),
      interactionType: InteractionType.QUERY,
    });

    return NextResponse.json({
      success: true,
      response: responseText,
      recommendations: topRecommendations,
      language,
      category: category || null,
      sessionId: interactionSessionId,
    });
  } catch (error: any) {
    console.error('AI recommendation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to get recommendations',
      response: 'Sorry, I could not find shops right now. Please try again.',
      recommendations: [],
    }, { status: 500 });
  }
}

