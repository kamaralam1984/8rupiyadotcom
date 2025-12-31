import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop, { ShopStatus } from '@/models/Shop';
import { calculateDistance } from '@/lib/location';

// Golu ka Perfect AI Brain (System Prompt)
const systemPrompt = `you are golu, the official ai assistant of 8rupiya.com. you speak hindi, english, and hinglish fluently.

your job:
1. understand user intent correctly.
2. if user asks:
   - "kahan hai" - give location info
   - "kya hai" - give meaning
   - "english kahan" - translate word to english
   - "hindi kahan" - translate word to hindi
   - "weather" - give weather
   - "shop" or "store" or "dukan" or "nearby shop" or "paas ki dukan" - Find nearby shops and provide shop details with phone numbers, addresses, and connection options (call, WhatsApp links). Always include shop phone numbers and connection links when available.
3. never guess wrong meaning.
4. always reply short, friendly and helpful.
5. prefer hindi when user types hindi.
6. when user asks about shops, provide:
   - Shop name, address, distance (if location available)
   - Phone number with call link (tel:)
   - WhatsApp link if phone available (https://wa.me/)
   - Shop page link (/shops/shop-id)
   - Always encourage user to connect with shop directly

examples:
user: apple ka hindi batao
reply: 🍎 apple ka hindi: seb

user: patna kahan hai
reply: 📍 patna bihar ki rajdhani hai.

user: mere paas medical shop
reply: 🏥 aapke paas peh medical stores hain:
1. **Medical Store Name**
   📍 Address, City
   📞 Call: tel:+91-XXXXXXXXXX
   💬 WhatsApp: https://wa.me/91XXXXXXXXXX
   🔗 Shop Link: /shops/shop-id

Aap directly call ya WhatsApp kar sakte hain!`;

// Check if query is about shops
function isShopQuery(message: string): boolean {
  const shopKeywords = /(shop|store|dukan|nearby|paas|kahan|chahiye|dhund|find|search|connect|call|phone)/i;
  return shopKeywords.test(message);
}

// Extract category/business type from query
function extractBusinessType(message: string): string {
  const categories = [
    'grocery', 'kirana', 'restaurant', 'hotel', 'cafe', 'bakery',
    'pharmacy', 'medical', 'clinic', 'hospital', 'doctor',
    'salon', 'parlour', 'spa', 'gym', 'fitness',
    'electronics', 'mobile', 'computer', 'hardware',
    'clothing', 'boutique', 'tailor', 'fashion',
    'jewellery', 'gold', 'silver',
    'taxi', 'cab', 'travel', 'tour',
    'bank', 'atm', 'finance',
  ];
  
  for (const category of categories) {
    if (new RegExp(category, 'i').test(message)) {
      return category;
    }
  }
  
  return message.replace(/(shop|store|dukan|kahan|where|paas|nearby|hai|chahiye|dhund|find|search)/gi, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const { message, userLocation } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { reply: 'Maaf kijiye, AI service abhi available nahi hai. Kripya thodi der baad try karein.' },
        { status: 500 }
      );
    }

    let enhancedPrompt = systemPrompt;
    let shopData = '';

    // If shop query, find shops from database
    if (isShopQuery(message)) {
      try {
        await connectDB();
        
        const businessType = extractBusinessType(message);
        const hasValidCoords = userLocation && 
                              userLocation.latitude && 
                              userLocation.longitude &&
                              !isNaN(userLocation.latitude) && 
                              !isNaN(userLocation.longitude);

        let mongoQuery: any = {
          status: { $in: [ShopStatus.ACTIVE, ShopStatus.APPROVED] },
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

        if (businessType && businessType.length >= 2) {
          mongoQuery.$or = [
            { category: { $regex: businessType, $options: 'i' } },
            { name: { $regex: businessType, $options: 'i' } },
          ];
        }

        if (hasValidCoords) {
          try {
            mongoQuery.location = {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: [userLocation.longitude, userLocation.latitude],
                },
                $maxDistance: 50000, // 50km
              },
            };
          } catch (geoError) {
            // Continue without geospatial query
          }
        }

        let shops: any[] = [];
        try {
          shops = await Shop.find(mongoQuery)
            .select('name category address city phone location rating reviewCount _id')
            .limit(5)
            .lean();
        } catch (error: any) {
          if (error.message?.includes('index') || error.message?.includes('near')) {
            delete mongoQuery.location;
            shops = await Shop.find(mongoQuery)
              .select('name category address city phone location rating reviewCount _id')
              .limit(5)
              .lean();
          }
        }

        // Calculate distances
        if (hasValidCoords && shops.length > 0) {
          for (const shop of shops) {
            if (shop.location?.coordinates && shop.location.coordinates.length === 2) {
              const shopLng = shop.location.coordinates[0];
              const shopLat = shop.location.coordinates[1];
              if (!isNaN(shopLng) && !isNaN(shopLat)) {
                shop.distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  shopLat,
                  shopLng
                );
              }
            }
          }
          shops.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
        }

        if (shops.length > 0) {
          shopData = '\n\nAvailable Shops Data:\n';
          shops.forEach((shop: any, index: number) => {
            const phoneClean = shop.phone ? shop.phone.replace(/[^0-9]/g, '') : '';
            shopData += `${index + 1}. Name: ${shop.name}\n`;
            shopData += `   Category: ${shop.category}\n`;
            shopData += `   Address: ${shop.address}, ${shop.city}\n`;
            if (shop.distance) {
              shopData += `   Distance: ${shop.distance.toFixed(1)} km\n`;
            }
            if (shop.phone) {
              shopData += `   Phone: ${shop.phone}\n`;
              shopData += `   Call Link: tel:${shop.phone}\n`;
              if (phoneClean) {
                shopData += `   WhatsApp: https://wa.me/${phoneClean}\n`;
              }
            }
            shopData += `   Shop Link: /shops/${shop._id}\n`;
            if (shop.rating > 0) {
              shopData += `   Rating: ${shop.rating.toFixed(1)} (${shop.reviewCount || 0} reviews)\n`;
            }
            shopData += '\n';
          });
          shopData += 'Use this shop data to provide accurate response with all connection options.';
        } else {
          shopData = '\n\nNo shops found in database for this query.';
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        shopData = '\n\nShop database temporarily unavailable.';
      }
    }

    // Build final prompt with shop data
    const finalPrompt = `${enhancedPrompt}${shopData}\n\nUser: ${message}\n\nGolu:`;

    // Gemini API call
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: finalPrompt,
          }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { reply: 'Maaf kijiye, response generate karne me problem ho rahi hai. Kripya phir se try karein.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Kuch samajh nahi aaya. Kripya phir se try karein.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Golu API error:', error);
    return NextResponse.json(
      { reply: 'Maaf kijiye, server me problem ho rahi hai. Kripya thodi der baad try karein.' },
      { status: 500 }
    );
  }
}

