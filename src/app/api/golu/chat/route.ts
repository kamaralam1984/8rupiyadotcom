import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GoluConversation, { CommandCategory, ConversationType } from '@/models/GoluConversation';
import Reminder, { ReminderType, ReminderStatus } from '@/models/Reminder';
import Shop from '@/models/Shop';
import UserProfile from '@/models/UserProfile';
import MedicalRecord from '@/models/MedicalRecord';
import FamilyMember from '@/models/FamilyMember';
import Payment from '@/models/Payment';
import { withAuth, AuthRequest } from '@/middleware/auth';
import {
  detectCommandCategory,
  parseTimeFromText,
  parseMedicineSchedule,
  parseMeetingReminder,
  generateFriendlyResponse,
  getCurrentTimeIndian,
  getCurrentDateIndian,
  calculateFromText,
} from '@/lib/golu';
import {
  translateText,
  detectLanguage,
  googleSearch,
  getLocationDetails,
  calculateDistance,
  getWeather,
  getNewsHeadlines,
} from '@/lib/google-apis';

// POST /api/golu/chat - Main GOLU chat endpoint (OPTIONAL AUTH)
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    await connectDB();

    const { query, sessionId, type = 'TEXT', userLocation } = await req.json();

    if (!query || !sessionId) {
      return NextResponse.json({ error: 'Query and sessionId required' }, { status: 400 });
    }

    // Optional authentication - get user if token is provided
    let user: any = null;
    let userName: string | undefined = undefined;
    
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
      if (token) {
        const { verifyToken } = await import('@/lib/auth');
        const payload = verifyToken(token);
        if (payload) {
          user = { userId: payload.userId, role: payload.role };
        }
      }
    } catch (authError) {
      // Auth failed but continue - some features will work without auth
      console.log('GOLU: Running without authentication');
    }

    // Detect language
    const detectedLanguage = await detectLanguage(query);
    let workingQuery = query;
    let translatedQuery = undefined;

    // Translate to Hindi/English if needed
    if (detectedLanguage !== 'hi' && detectedLanguage !== 'en') {
      const translation = await translateText(query, 'hi');
      translatedQuery = translation.translatedText;
      workingQuery = translatedQuery;
    }

    // Detect command category
    const category = detectCommandCategory(workingQuery) as CommandCategory;
    
    // Debug logging
    console.log('GOLU Debug - Query:', query);
    console.log('GOLU Debug - Working Query:', workingQuery);
    console.log('GOLU Debug - Detected Category:', category);

    let response = '';
    let metadata: any = {};
    let wasSuccessful = true;
    let errorMessage = undefined;

    try {
      // Process based on category
      switch (category) {
        case 'ALARM':
          const alarmResult = await processAlarm(workingQuery, user?.userId, userName);
          response = alarmResult.response;
          metadata = alarmResult.metadata;
          break;

        case 'REMINDER':
          const reminderResult = await processReminder(workingQuery, user?.userId, userName);
          response = reminderResult.response;
          metadata = reminderResult.metadata;
          break;

        case 'MEDICINE':
          const medicineResult = await processMedicine(workingQuery, user?.userId, userName);
          response = medicineResult.response;
          metadata = medicineResult.metadata;
          break;

        case 'MEETING':
          const meetingResult = await processMeeting(workingQuery, user?.userId, userName);
          response = meetingResult.response;
          metadata = meetingResult.metadata;
          break;

        case 'LOCATION':
          const locationResult = await processLocation(workingQuery, userLocation, userName);
          response = locationResult.response;
          metadata = locationResult.metadata;
          break;

        case 'TRANSLATION':
          const translationResult = await processTranslation(workingQuery, userName);
          response = translationResult.response;
          metadata = translationResult.metadata;
          break;

        case 'WEATHER':
          const weatherResult = await processWeather(workingQuery, userName);
          response = weatherResult.response;
          metadata = weatherResult.metadata;
          break;

        case 'SHOPPING':
          const shoppingResult = await processShopping(workingQuery, userLocation, userName);
          response = shoppingResult.response;
          metadata = shoppingResult.metadata;
          break;

        case 'CALCULATION':
          const calcResult = await processCalculation(workingQuery, userName);
          response = calcResult.response;
          metadata = calcResult.metadata;
          break;

        case 'TIME_DATE':
          response = processTimeDate(workingQuery, userName);
          break;

        case 'NEWS':
          const newsResult = await processNews(workingQuery, userName);
          response = newsResult.response;
          metadata = newsResult.metadata;
          break;

        case 'SEARCH':
          const searchResult = await processSearch(workingQuery, userName);
          response = searchResult.response;
          metadata = searchResult.metadata;
          break;

        case 'PROFILE':
          const profileResult = await processProfile(workingQuery, user?.userId, userName);
          response = profileResult.response;
          metadata = profileResult.metadata;
          break;

        case 'FINANCIAL':
          const financialResult = await processFinancial(workingQuery, user?.userId, userName);
          response = financialResult.response;
          metadata = financialResult.metadata;
          break;

        case 'MEDICAL':
          const medicalResult = await processMedical(workingQuery, user?.userId, userName);
          response = medicalResult.response;
          metadata = medicalResult.metadata;
          break;

        case 'FAMILY':
          const familyResult = await processFamily(workingQuery, user?.userId, userName);
          response = familyResult.response;
          metadata = familyResult.metadata;
          break;

        case 'BUSINESS':
          const businessResult = await processBusiness(workingQuery, user?.userId, userName);
          response = businessResult.response;
          metadata = businessResult.metadata;
          break;

        case 'ASTROLOGY':
          const astrologyResult = await processAstrology(workingQuery, user?.userId, userName);
          response = astrologyResult.response;
          metadata = astrologyResult.metadata;
          break;

        case 'TRAVEL':
          const travelResult = await processTravel(workingQuery, userLocation, userName);
          response = travelResult.response;
          metadata = travelResult.metadata;
          break;

        case 'CATEGORY':
          const categoryResult = await processCategory(workingQuery, userName);
          response = categoryResult.response;
          metadata = categoryResult.metadata;
          break;

        default:
          // For general queries, try Google Search
          const generalResult = await processGeneralQuery(workingQuery, userName);
          response = generalResult.response;
          metadata = generalResult.metadata;
          break;
      }
    } catch (processError: any) {
      console.error('GOLU processing error:', processError);
      wasSuccessful = false;
      errorMessage = processError.message;
      response = generateFriendlyResponse(userName, 'Maaf kijiye, mujhe thodi problem ho rahi hai. Kripya phir se try karein.');
    }

    // Translate response back to user's language if needed
    let responseInUserLanguage = response;
    if (detectedLanguage !== 'hi' && detectedLanguage !== 'en') {
      const translation = await translateText(response, detectedLanguage);
      responseInUserLanguage = translation.translatedText;
    }

    const processingTimeMs = Date.now() - startTime;

    // Save conversation (only if user is logged in)
    let conversationId = null;
    try {
      const conversation = await GoluConversation.create({
        userId: user?.userId || null,
        sessionId,
        type: type === 'VOICE' ? ConversationType.VOICE : ConversationType.TEXT,
        userQuery: query,
        detectedLanguage,
        translatedQuery,
        category,
        goluResponse: response,
        responseInUserLanguage,
        metadata,
        wasSuccessful,
        errorMessage,
        processingTimeMs,
      });
      conversationId = conversation._id;
    } catch (convError) {
      console.log('Could not save conversation (user may not be logged in)');
    }

    return NextResponse.json({
      success: true,
      response: responseInUserLanguage,
      originalResponse: response,
      category,
      detectedLanguage,
      metadata,
      conversationId,
      requiresAuth: !user && ['PROFILE', 'FINANCIAL', 'MEDICAL', 'FAMILY', 'BUSINESS'].includes(category),
    });
  } catch (error: any) {
    console.error('GOLU chat error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper functions for processing different command types

async function processAlarm(query: string, userId: any, userName?: string) {
  const time = parseTimeFromText(query);
  
  if (!userId) {
    return {
      response: generateFriendlyResponse(userName, 'Alarm set karne ke liye please login kariye. Weather, time, calculator jaise features bina login ke available hain!'),
      metadata: { requiresAuth: true },
    };
  }
  
  if (!time) {
    return {
      response: generateFriendlyResponse(userName, 'Maaf kijiye, main time samajh nahi paya. Kripya "subah 5 baje utha dena" ya "sham 6 baje alarm set karo" jaise boliye.'),
      metadata: {},
    };
  }

  // Create alarm reminder
  await Reminder.create({
    userId,
    type: ReminderType.ALARM,
    title: 'Alarm',
    message: `${userName || 'Bhai'} uth jao, time ho gaya hai!`,
    scheduledTime: time,
    status: ReminderStatus.ACTIVE,
    voiceCommand: query,
  });

  const timeStr = time.toLocaleString('hi-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
  return {
    response: generateFriendlyResponse(userName, `Theek hai, main aapko ${timeStr} par jagaunga.`),
    metadata: { scheduledTime: time },
  };
}

async function processReminder(query: string, userId: any, userName?: string) {
  if (!userId) {
    return {
      response: generateFriendlyResponse(userName, 'Reminder set karne ke liye please login kariye. Weather, time, calculator jaise features bina login ke available hain!'),
      metadata: { requiresAuth: true },
    };
  }
  
  const time = parseTimeFromText(query);
  
  if (!time) {
    return {
      response: generateFriendlyResponse(userName, 'Kripya remind karne ka time bataiye, jaise "3 baje yaad dilana" ya "sham 5 baje bata dena".'),
      metadata: {},
    };
  }

  await Reminder.create({
    userId,
    type: ReminderType.GENERAL,
    title: 'Reminder',
    message: query,
    scheduledTime: time,
    status: ReminderStatus.ACTIVE,
    voiceCommand: query,
  });

  const timeStr = time.toLocaleString('hi-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
  return {
    response: generateFriendlyResponse(userName, `Pakka, main aapko ${timeStr} par yaad dila dunga.`),
    metadata: { scheduledTime: time },
  };
}

async function processMedicine(query: string, userId: any, userName?: string) {
  if (!userId) {
    return {
      response: generateFriendlyResponse(userName, 'Please login kariye medicine schedule set karne ke liye.'),
      metadata: {},
    };
  }

  const schedule = parseMedicineSchedule(query);
  
  if (schedule.length === 0) {
    return {
      response: generateFriendlyResponse(userName, 'Kripya medicine ka naam aur time bataiye, jaise "Subah 8 baje BP ki dawa 1 tablet".'),
      metadata: {},
    };
  }

  // Get or create medical record
  let medicalRecord = await MedicalRecord.findOne({ userId });
  if (!medicalRecord) {
    medicalRecord = await MedicalRecord.create({ userId, medicines: [], appointments: [], healthChecks: [] });
  }

  // Create reminders for each medicine
  const createdReminders = [];
  for (const med of schedule) {
    // Determine if it's recurring
    const isRecurring = med.frequency === 'daily' || med.frequency === 'twice-daily' || med.frequency === 'weekly';
    
    // Build recurring pattern
    let recurringPattern: any = undefined;
    if (isRecurring) {
      if (med.frequency === 'daily') {
        recurringPattern = { frequency: 'daily' };
      } else if (med.frequency === 'weekly') {
        recurringPattern = { frequency: 'weekly' };
      } else if (med.frequency === 'twice-daily') {
        recurringPattern = { frequency: 'custom', customInterval: 12 * 60 }; // 12 hours
      }
    }

    // Create reminder
    const reminder = await Reminder.create({
      userId,
      type: ReminderType.MEDICINE,
      title: `💊 Medicine: ${med.medicine}`,
      message: `${userName || 'Ji'}, ${med.medicine} lene ka time ho gaya hai${med.dosage ? ` (${med.dosage})` : ''}${med.withFood ? ' - Khane ke baad lena hai' : ''}`,
      scheduledTime: med.time,
      notifyBeforeMinutes: 5,
      isRecurring,
      recurringPattern,
      status: ReminderStatus.ACTIVE,
      metadata: {
        medicineName: med.medicine,
        dosage: med.dosage || '1 tablet',
      },
      voiceCommand: query,
    });
    createdReminders.push(reminder);

    // Add to medical record if not already present
    const medicineExists = medicalRecord.medicines.find(
      (m: any) => m.name.toLowerCase() === med.medicine.toLowerCase()
    );

    if (!medicineExists && isRecurring) {
      // Extract time string (HH:MM format)
      const timeString = `${med.time.getHours().toString().padStart(2, '0')}:${med.time.getMinutes().toString().padStart(2, '0')}`;
      
      medicalRecord.medicines.push({
        name: med.medicine,
        dosage: med.dosage || '1 tablet',
        frequency: med.frequency || 'daily',
        timings: [timeString],
        withFood: med.withFood || false,
        startDate: new Date(),
        reminderEnabled: true,
      } as any);
      
      await medicalRecord.save();
    }
  }

  // Build response message
  let response = `Theek hai ${userName || 'Ji'}, maine ${schedule.length} medicine reminder${schedule.length > 1 ? 's' : ''} set kar diye hain:\n\n`;
  
  for (const med of schedule) {
    const timeStr = med.time.toLocaleString('hi-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
    response += `💊 ${med.medicine}`;
    if (med.dosage) response += ` - ${med.dosage}`;
    response += ` @ ${timeStr}`;
    if (med.frequency === 'daily') response += ` (रोज़)`;
    if (med.withFood) response += ` 🍽️`;
    response += '\n';
  }

  response += '\nMain aapko time par yaad dila dunga! 😊';

  return {
    response: generateFriendlyResponse(userName, response),
    metadata: { 
      medicines: schedule,
      reminders: createdReminders.length,
      recurring: schedule.filter(m => m.frequency).length,
    },
  };
}

async function processMeeting(query: string, userId: any, userName?: string) {
  if (!userId) {
    return {
      response: generateFriendlyResponse(userName, 'Please login kariye meeting reminder set karne ke liye.'),
      metadata: {},
    };
  }

  const meeting = parseMeetingReminder(query);
  
  if (!meeting) {
    return {
      response: generateFriendlyResponse(userName, 'Kripya meeting ka time aur kitne minute pahle yaad dilana hai bataiye.'),
      metadata: {},
    };
  }

  await Reminder.create({
    userId,
    type: ReminderType.MEETING,
    title: meeting.title,
    message: `${userName || 'Bhai'}, aapki meeting hai.`,
    scheduledTime: meeting.time,
    notifyBeforeMinutes: meeting.notifyBeforeMinutes,
    status: ReminderStatus.ACTIVE,
    metadata: { meetingTitle: meeting.title },
    voiceCommand: query,
  });

  const timeStr = meeting.time.toLocaleString('hi-IN', { hour: 'numeric', minute: 'numeric', hour12: true });
  return {
    response: generateFriendlyResponse(userName, `Theek hai, main aapko ${meeting.notifyBeforeMinutes} minute pahle yaad dila dunga. Meeting ka time ${timeStr} hai.`),
    metadata: { meeting },
  };
}

async function processLocation(query: string, userLocation: any, userName?: string) {
  // Extract place name from query
  const placeMatch = query.match(/([\w\s]+)\s+(kahan|where|dur|distance)/i);
  const place = placeMatch ? placeMatch[1].trim() : query.replace(/(kahan|where|dur|distance|hai|paas|nearby)/gi, '').trim();

  const locationData = await getLocationDetails(place);
  
  if (!locationData) {
    return {
      response: generateFriendlyResponse(userName, `Maaf kijiye, main "${place}" ka location nahi dhund paya. Kripya sahi naam bataiye.`),
      metadata: {},
    };
  }

  let response = `${place} yahan hai: ${locationData.formattedAddress}`;

  // Calculate distance if user location available
  if (userLocation && userLocation.latitude && userLocation.longitude) {
    const distance = await calculateDistance(
      { lat: userLocation.latitude, lng: userLocation.longitude },
      { lat: locationData.latitude, lng: locationData.longitude }
    );

    if (distance) {
      response += `. Aap se ${distance.distance} dur hai, pahunchne me lagbhag ${distance.duration} lagega.`;
    }
  }

  return {
    response: generateFriendlyResponse(userName, response),
    metadata: { locationData },
  };
}

async function processTranslation(query: string, userName?: string) {
  // Extract text to translate
  const translateMatch = query.match(/translate\s+(.+)|(.+)\s+ka\s+matlab/i);
  const textToTranslate = translateMatch ? (translateMatch[1] || translateMatch[2]).trim() : query;

  // Detect if user wants English or Hindi
  const wantsEnglish = /english|angrezi/i.test(query);
  const targetLang = wantsEnglish ? 'en' : 'hi';

  const translation = await translateText(textToTranslate, targetLang);

  return {
    response: generateFriendlyResponse(userName, `"${textToTranslate}" ka matlab hai: "${translation.translatedText}"`),
    metadata: { translationData: translation },
  };
}

async function processWeather(query: string, userName?: string) {
  // Extract city name - improved pattern matching
  let city = 'Patna'; // Default city
  
  // Pattern 1: "City ka/ke mausam"
  let cityMatch = query.match(/([\w\s]+?)\s+(?:ka|ke|me|mein)\s+(?:mausam|weather)/i);
  if (cityMatch) {
    city = cityMatch[1].trim();
  } else {
    // Pattern 2: "Mausam City me"
    cityMatch = query.match(/(?:mausam|weather)\s+(?:me|mein)?\s*([\w\s]+)/i);
    if (cityMatch) {
      city = cityMatch[1].trim();
    } else {
      // Pattern 3: Just city name with weather
      cityMatch = query.match(/(delhi|patna|mumbai|bangalore|kolkata|chennai|hyderabad|pune|ahmedabad|jaipur)/i);
      if (cityMatch) {
        city = cityMatch[1].trim();
      }
    }
  }

  // Clean city name
  city = city.replace(/\s+(mausam|weather|kaisa|kya|hai)\s*/gi, '').trim();

  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  // If no API key, provide helpful fallback
  if (!apiKey) {
    return {
      response: generateFriendlyResponse(
        userName, 
        `${city} ka mausam jaanne ke liye API key chahiye. Abhi ke liye weather.com ya news dekh sakte hain. Main baaki sab features me aapki madad kar sakta hoon!`
      ),
      metadata: { city, apiKeyMissing: true },
    };
  }

  const weather = await getWeather(city);
  
  if (!weather) {
    return {
      response: generateFriendlyResponse(
        userName, 
        `Maaf kijiye, main "${city}" ka mausam nahi pata kar paya. Kripya sahi city naam bataiye jaise "Patna", "Delhi", "Mumbai" etc.`
      ),
      metadata: { city, error: 'Weather data not found' },
    };
  }

  // Generate smart response based on weather
  let response = `${weather.city} me abhi ${weather.temperature}°C hai. Mausam ${weather.description} hai. Humidity ${weather.humidity}% hai.`;
  
  // Add suggestions based on temperature
  if (weather.temperature > 35) {
    response += ' 🌡️ Bahut garmi hai! AC on rakhe, paani peete rahe aur bahar kam nikle.';
  } else if (weather.temperature > 30) {
    response += ' ☀️ Garmi hai, halke kapde pehne aur hydrated rahe.';
  } else if (weather.temperature < 15) {
    response += ' 🧥 Thand hai! Garm kapde pehen ke nikle.';
  } else if (weather.temperature < 10) {
    response += ' ❄️ Bahut thand hai! Jacket zaroor pehne.';
  }
  
  // Add rain warning
  if (weather.description && /rain|baarish/i.test(weather.description)) {
    response += ' ☔ Umbrella le jana na bhule!';
  }

  return {
    response: generateFriendlyResponse(userName, response),
    metadata: { weatherData: weather, city },
  };
}

async function processShopping(query: string, userLocation: any, userName?: string) {
  // Extract business type
  const businessType = query.replace(/(shop|store|dukan|kahan|where|paas|nearby|hai)/gi, '').trim();

  // Search in 8rupiya database
  const shops = await Shop.find({
    $or: [
      { name: { $regex: businessType, $options: 'i' } },
      { category: { $regex: businessType, $options: 'i' } },
    ],
    status: 'APPROVED',
  })
    .limit(5)
    .select('name category address city phone')
    .lean();

  if (shops.length === 0) {
    return {
      response: generateFriendlyResponse(userName, `Maaf kijiye, "${businessType}" ke liye koi shop nahi mili. Aap kuch aur try kar sakte hain.`),
      metadata: {},
    };
  }

  const shopList = shops.map((s: any, i: number) => `${i + 1}. ${s.name} - ${s.address}, ${s.city}`).join(', ');
  const response = `${businessType} ke liye maine ${shops.length} shops dhundi hain: ${shopList}`;

  return {
    response: generateFriendlyResponse(userName, response),
    metadata: { shopResults: shops },
  };
}

async function processCalculation(query: string, userName?: string) {
  const result = calculateFromText(query);
  
  if (result === null) {
    return {
      response: generateFriendlyResponse(userName, 'Maaf kijiye, main calculation samajh nahi paya. Kripya "2 plus 3" ya "10 guna 5" jaise boliye.'),
      metadata: {},
    };
  }

  return {
    response: generateFriendlyResponse(userName, `Jawab hai: ${result}`),
    metadata: { calculationResult: result },
  };
}

function processTimeDate(query: string, userName?: string): string {
  if (/time|kitne baje/i.test(query)) {
    return generateFriendlyResponse(userName, `Abhi ${getCurrentTimeIndian()} hain.`);
  }
  
  if (/date|din|tarikh/i.test(query)) {
    return generateFriendlyResponse(userName, getCurrentDateIndian());
  }

  return generateFriendlyResponse(userName, `Abhi ${getCurrentTimeIndian()} hain. ${getCurrentDateIndian()}`);
}

async function processNews(query: string, userName?: string) {
  const headlines = await getNewsHeadlines();
  
  if (headlines.length === 0) {
    return {
      response: generateFriendlyResponse(userName, 'Maaf kijiye, abhi news nahi mil pa rahi hai.'),
      metadata: {},
    };
  }

  const newsList = headlines.slice(0, 3).map((n: any, i: number) => `${i + 1}. ${n.title}`).join('. ');
  const response = `Aaj ki top news: ${newsList}`;

  return {
    response: generateFriendlyResponse(userName, response),
    metadata: { newsResults: headlines },
  };
}

async function processSearch(query: string, userName?: string) {
  const searchResults = await googleSearch(query);
  
  if (searchResults.length === 0) {
    return {
      response: generateFriendlyResponse(userName, 'Maaf kijiye, mujhe koi jawab nahi mila. Kripya aur detail me puchiye.'),
      metadata: {},
    };
  }

  const answer = searchResults[0].snippet;
  const response = `${answer} (Source: ${searchResults[0].title})`;

  return {
    response: generateFriendlyResponse(userName, response),
    metadata: { searchResults },
  };
}

// NEW ADVANCED FEATURES

async function processProfile(query: string, userId: any, userName?: string) {
  if (!userId) {
    return {
      response: generateFriendlyResponse(userName, 'Please login kariye aapki profile information save karne ke liye.'),
      metadata: {},
    };
  }

  let profile = await UserProfile.findOne({ userId });
  if (!profile) {
    profile = await UserProfile.create({
      userId,
      fullName: userName || 'User',
      preferences: { language: 'hi', notifications: true, voiceEnabled: true },
    });
  }

  // Extract information from query
  const updates: any = {};

  // Name/Nickname
  if (/mera naam|my name|call me|bula|naam/i.test(query)) {
    const nameMatch = query.match(/(?:naam|name|call me|bula)\s+(.+?)(?:\s+hai|\s+is|$)/i);
    if (nameMatch) {
      updates.nickName = nameMatch[1].trim();
    }
  }

  // Birthday
  if (/birthday|janamdin|janm/i.test(query)) {
    // Extract date (simplified - can be improved)
    const dateMatch = query.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      const year = parseInt(dateMatch[3]);
      updates.dateOfBirth = new Date(year < 100 ? 2000 + year : year, month, day);
    }
  }

  // Location/City
  if (/city|city|shahar|rehta|live|rahta/i.test(query)) {
    const cityMatch = query.match(/(?:me|mein|in)\s+(.+?)(?:\s+(?:rehta|live|rahta|hoon|hai))/i);
    if (cityMatch) {
      updates['location.city'] = cityMatch[1].trim();
    }
  }

  if (Object.keys(updates).length > 0) {
    await UserProfile.findOneAndUpdate({ userId }, { $set: updates }, { new: true });
    
    return {
      response: generateFriendlyResponse(userName, `Theek hai, maine yaad kar liya! Main aapki sabhi baatein yaad rakhunga.`),
      metadata: { updates },
    };
  }

  // If asking about profile info
  const greeting = userName || profile.nickName || profile.fullName;
  let response = `Namaste ${greeting}! `;
  
  if (profile.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear();
    response += `Aapki umar ${age} saal hai. `;
  }
  
  if (profile.location?.city) {
    response += `Aap ${profile.location.city} me rehte hain. `;
  }

  return {
    response: generateFriendlyResponse(userName, response || 'Aap apni details bataiye, main yaad rakhlunga!'),
    metadata: { profile },
  };
}

async function processFinancial(query: string, userId: any, userName?: string) {
  if (!userId) {
    return {
      response: generateFriendlyResponse(userName, 'Please login kariye financial reminders set karne ke liye.'),
      metadata: {},
    };
  }

  let profile = await UserProfile.findOne({ userId });
  if (!profile) {
    profile = await UserProfile.create({
      userId,
      fullName: userName || 'User',
    });
  }

  // Salary date
  if (/salary|tankhuwa.*aati|aati.*salary/i.test(query)) {
    const dateMatch = query.match(/(\d{1,2})\s*(?:tareekh|tarikh|date|ko)/i);
    if (dateMatch) {
      const salaryDate = parseInt(dateMatch[1]);
      await UserProfile.findOneAndUpdate(
        { userId },
        { $set: { 'financial.salaryDate': salaryDate } }
      );

      // Create monthly recurring reminder
      const nextSalaryDate = new Date();
      nextSalaryDate.setDate(salaryDate);
      if (nextSalaryDate < new Date()) {
        nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
      }

      await Reminder.create({
        userId,
        type: ReminderType.SALARY,
        title: 'Salary Day',
        message: `${userName || 'Kamar ji'}, aaj aapki salary aane wali hai!`,
        scheduledTime: nextSalaryDate,
        isRecurring: true,
        recurringPattern: { frequency: 'monthly' },
        status: ReminderStatus.ACTIVE,
        voiceCommand: query,
      });

      return {
        response: generateFriendlyResponse(userName, `Theek hai! Maine yaad kar liya ki aapki salary har mahine ${salaryDate} tareekh ko aati hai. Main aapko yaad dilata rahunga.`),
        metadata: { salaryDate },
      };
    }
  }

  // Rent
  if (/rent.*dena|dena.*rent/i.test(query)) {
    const dateMatch = query.match(/(\d{1,2})\s*(?:tareekh|tarikh|date|ko)/i);
    const amountMatch = query.match(/(\d+)\s*(?:rupee|rupaye|rs|₹)?/i);
    
    if (dateMatch) {
      const rentDate = parseInt(dateMatch[1]);
      const rentAmount = amountMatch ? parseInt(amountMatch[1]) : undefined;
      
      const updates: any = { 'financial.rentDate': rentDate };
      if (rentAmount) updates['financial.rentAmount'] = rentAmount;
      
      await UserProfile.findOneAndUpdate({ userId }, { $set: updates });

      // Create monthly recurring reminder (notify 1 day before)
      const nextRentDate = new Date();
      nextRentDate.setDate(rentDate - 1);
      if (nextRentDate < new Date()) {
        nextRentDate.setMonth(nextRentDate.getMonth() + 1);
      }

      await Reminder.create({
        userId,
        type: ReminderType.RENT,
        title: 'Rent Reminder',
        message: `${userName || 'Kamar ji'}, kal rent dena hai${rentAmount ? ` ₹${rentAmount}` : ''}!`,
        scheduledTime: nextRentDate,
        isRecurring: true,
        recurringPattern: { frequency: 'monthly' },
        status: ReminderStatus.ACTIVE,
        metadata: { amount: rentAmount },
        voiceCommand: query,
      });

      return {
        response: generateFriendlyResponse(userName, `Pakka! Maine set kar diya. Main aapko har mahine ${rentDate} tareekh se ek din pahle yaad dilaunga ki rent dena hai${rentAmount ? ` ₹${rentAmount}` : ''}.`),
        metadata: { rentDate, rentAmount },
      };
    }
  }

  // Electricity/Light bill
  if (/light bill|bijli ka bill|electricity/i.test(query)) {
    const dateMatch = query.match(/(\d{1,2})\s*(?:tareekh|tarikh|date|ko)/i);
    if (dateMatch) {
      const billDate = parseInt(dateMatch[1]);
      await UserProfile.findOneAndUpdate(
        { userId },
        { $set: { 'financial.electricityBillDate': billDate } }
      );

      // Create monthly recurring reminder with 3 alerts
      const nextBillDate = new Date();
      nextBillDate.setDate(billDate);
      if (nextBillDate < new Date()) {
        nextBillDate.setMonth(nextBillDate.getMonth() + 1);
      }

      await Reminder.create({
        userId,
        type: ReminderType.BILL,
        title: 'Light Bill',
        message: `${userName || 'Kamar ji'}, light bill bharna hai!`,
        scheduledTime: nextBillDate,
        isRecurring: true,
        recurringPattern: { frequency: 'monthly' },
        status: ReminderStatus.ACTIVE,
        metadata: { billName: 'Electricity', category: 'utility' },
        voiceCommand: query,
      });

      return {
        response: generateFriendlyResponse(userName, `Theek hai! Light bill ki yaad dilata rahunga har mahine ${billDate} tareekh ko. Agar bill nahi bhara toh 3 baar alert dunga.`),
        metadata: { billDate },
      };
    }
  }

  return {
    response: generateFriendlyResponse(userName, 'Aap apni salary date, rent date ya bill date bataiye. Jaise "Meri salary 1 tareekh ko aati hai" ya "Rent 5 tareekh ko dena hota hai".'),
    metadata: {},
  };
}

async function processMedical(query: string, userId: any, userName?: string) {
  if (!userId) {
    return {
      response: generateFriendlyResponse(userName, 'Please login kariye medical information save karne ke liye.'),
      metadata: {},
    };
  }

  let medical = await MedicalRecord.findOne({ userId });
  if (!medical) {
    medical = await MedicalRecord.create({
      userId,
      medicines: [],
      appointments: [],
      healthChecks: [],
    });
  }

  // Health condition
  if (/sugar|diabetes|BP|blood pressure|thyroid/i.test(query)) {
    const condition = query.match(/(sugar|diabetes|BP|blood pressure|thyroid|heart)/i)?.[0];
    if (condition) {
      await MedicalRecord.findOneAndUpdate(
        { userId },
        { $addToSet: { 'medical.conditions': condition } }
      );

      return {
        response: generateFriendlyResponse(userName, `Theek hai, maine yaad kar liya ki aapko ${condition} hai. Main aapki health ka dhyan rakhunga. Regular checkup aur diet ka reminder dunga.`),
        metadata: { condition },
      };
    }
  }

  // Medicine schedule
  if (/dawa|medicine|tablet|goli/i.test(query)) {
    const schedule = parseMedicineSchedule(query);
    
    if (schedule.length > 0) {
      // Add to medical record
      for (const med of schedule) {
        await MedicalRecord.findOneAndUpdate(
          { userId },
          {
            $push: {
              medicines: {
                name: med.medicine,
                dosage: med.dosage || '1 tablet',
                frequency: 'daily',
                timings: [med.time.toTimeString().split(' ')[0].substring(0, 5)],
                withFood: query.includes('khana') || query.includes('food'),
                startDate: new Date(),
                reminderEnabled: true,
              },
            },
          }
        );

        // Create daily reminder
        await Reminder.create({
          userId,
          type: ReminderType.MEDICINE,
          title: `Medicine: ${med.medicine}`,
          message: `${userName || 'Bhai'}, ${med.medicine} lene ka time ho gaya hai${query.includes('khana') ? ' (khana ke saath)' : ''}.`,
          scheduledTime: med.time,
          isRecurring: true,
          recurringPattern: { frequency: 'daily' },
          notifyBeforeMinutes: 5,
          status: ReminderStatus.ACTIVE,
          metadata: {
            medicineName: med.medicine,
            dosage: med.dosage || '1 tablet',
          },
          voiceCommand: query,
        });
      }

      return {
        response: generateFriendlyResponse(userName, `Perfect! Maine ${schedule.length} medicine reminders set kar diye hain. Time par aapko yaad dilaunga. Aur diet ka bhi dhyan rakhunga.`),
        metadata: { medicines: schedule },
      };
    }
  }

  // Doctor appointment
  if (/doctor|appointment|checkup/i.test(query)) {
    return {
      response: generateFriendlyResponse(userName, 'Doctor appointment ke liye date aur time bataiye. Main yaad dila dunga aur ek din pahle bhi reminder dunga.'),
      metadata: {},
    };
  }

  return {
    response: generateFriendlyResponse(userName, 'Aap apni health condition ya medicine schedule bataiye. Jaise "Mujhe sugar hai" ya "BP ki dawa subah 9 baje leta hoon".'),
    metadata: {},
  };
}

async function processFamily(query: string, userId: any, userName?: string) {
  if (!userId) {
    return {
      response: generateFriendlyResponse(userName, 'Please login kariye family reminders set karne ke liye.'),
      metadata: {},
    };
  }

  // Family member medicine reminder
  if (/mummy|papa|wife|biwi|husband|pati|bachcha|beta|beti/i.test(query)) {
    const relationMatch = query.match(/(mummy|papa|wife|biwi|husband|pati|mother|father|bachcha|beta|beti)/i);
    const relation = relationMatch ? relationMatch[0] : 'family member';
    
    const timeMatch = query.match(/(\d{1,2})\s*baje/i);
    const medicineMatch = query.match(/dawa|medicine/i);

    if (timeMatch && medicineMatch) {
      const hour = parseInt(timeMatch[1]);
      const reminderTime = new Date();
      reminderTime.setHours(hour, 0, 0, 0);
      if (reminderTime < new Date()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      await Reminder.create({
        userId,
        type: ReminderType.MEDICINE,
        title: `${relation} ki dawa`,
        message: `${userName || 'Kamar ji'}, ${relation} ko dawa deni hai!`,
        scheduledTime: reminderTime,
        isRecurring: true,
        recurringPattern: { frequency: 'daily' },
        status: ReminderStatus.ACTIVE,
        metadata: { familyMemberName: relation },
        voiceCommand: query,
      });

      return {
        response: generateFriendlyResponse(userName, `Theek hai! Main aapko roz ${hour} baje ${relation} ki dawa ka reminder dunga. Main unka bhi dhyan rakhunga.`),
        metadata: { relation, time: reminderTime },
      };
    }
  }

  return {
    response: generateFriendlyResponse(userName, 'Family ke liye reminder set karne ke liye bataye. Jaise "Mummy ko 8 baje dawa yaad dilaana".'),
    metadata: {},
  };
}

async function processBusiness(query: string, userId: any, userName?: string) {
  if (!userId) {
    return {
      response: generateFriendlyResponse(userName, 'Please login kariye business statistics dekhne ke liye.'),
      metadata: {},
    };
  }

  // Get user's shops
  const shops = await Shop.find({ ownerId: userId, status: 'active' });

  if (shops.length === 0) {
    return {
      response: generateFriendlyResponse(userName, 'Aapka koi shop registered nahi hai 8rupiya.com par. Aap apna shop register kar sakte hain.'),
      metadata: {},
    };
  }

  const shopIds = shops.map((s) => s._id);

  // Get today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayPayments = await Payment.find({
    shopId: { $in: shopIds },
    createdAt: { $gte: today, $lt: tomorrow },
    status: 'completed',
  });

  const todaySales = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const todayCustomers = todayPayments.length;

  // Simple response for "aaj kitni sale"
  if (/aaj|today|sale|sales/i.test(query)) {
    return {
      response: generateFriendlyResponse(userName, `Aaj ₹${todaySales.toLocaleString('en-IN')} ki sale hui hai, ${todayCustomers} customers aaye hain. ${todayCustomers > 5 ? 'Bahut achha chal raha hai! 🎉' : 'Achha hai, aur better ho sakta hai! 💪'}`),
      metadata: { todaySales, todayCustomers },
    };
  }

  return {
    response: generateFriendlyResponse(userName, `Aapke ${shops.length} shops hain. Aaj tak achhi performance chal rahi hai!`),
    metadata: { shopCount: shops.length },
  };
}

async function processAstrology(query: string, userId: any, userName?: string) {
  // Get today's lucky info
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dateNum = today.getDate();

  const luckyColors = ['Lal (Red)', 'Narangi (Orange)', 'Peela (Yellow)', 'Hara (Green)', 'Neela (Blue)', 'Jamuni (Purple)', 'Safed (White)'];
  const todaysColor = luckyColors[dayOfWeek];

  const luckyNumber = (dateNum % 9) + 1;

  // General prediction
  const isLuckyDay = dateNum % 3 === 0;
  const prediction = isLuckyDay
    ? 'Aaj ka din aapke liye bahut achha hai! Naye kaam shuru kar sakte hain.'
    : 'Aaj normal din hai. Dhyan se kaam kare aur negative energy se bachein.';

  // Financial advice
  const financialAdvice = (dayOfWeek === 0 || dayOfWeek === 4)
    ? 'Investment ke liye achha din hai.'
    : (dayOfWeek === 2 || dayOfWeek === 6)
    ? 'Aaj bade investment avoid kare.'
    : 'Normal spending kare.';

  let profile = await UserProfile.findOne({ userId });
  const greetName = userName || profile?.nickName || profile?.fullName || 'Kamar ji';

  const response = `${greetName}, aaj aapke liye ${todaysColor} color lucky hai. Lucky number ${luckyNumber} hai. ${prediction} Business: ${financialAdvice} Health achhi rahegi, bas thoda dhyan rakhe.`;

  return {
    response: generateFriendlyResponse(greetName, response),
    metadata: { luckyColor: todaysColor, luckyNumber, isLuckyDay },
  };
}

async function processTravel(query: string, userLocation: any, userName?: string) {
  // Extract destination
  const destMatch = query.match(/(.+?)\s+(?:jaana|jana|jaa|go to|chahiye)/i);
  const destination = destMatch ? destMatch[1].trim() : null;

  if (!destination) {
    return {
      response: generateFriendlyResponse(userName, 'Aap kahan jaana chahte hain? Jaise "Patna station jaana hai" ya "Delhi jana hai".'),
      metadata: {},
    };
  }

  // Simple response (full Google Maps integration would require API key)
  const response = `${destination} jaane ke liye:\n- Ola Cabs: 1800-419-4141\n- Uber: 1800-208-4141\n- Rapido: 080-6812-6812\nGoogle Maps me "${destination}" search karke route dekh sakte hain.`;

  return {
    response: generateFriendlyResponse(userName, response),
    metadata: { destination },
  };
}

// Process category queries
async function processCategory(query: string, userName?: string) {
  try {
    const { extractCategoryFromQuery } = await import('@/lib/golu');
    const categoryName = extractCategoryFromQuery(query);
    
    // Fetch categories from database
    const Category = (await import('@/models/Category')).default;
    await connectDB();
    
    // If specific category mentioned, find it
    if (categoryName) {
      const category = await Category.findOne({
        name: { $regex: categoryName, $options: 'i' },
        isActive: true,
      });
      
      if (category) {
        const response = `${category.icon || ''} ${category.name}\n\n${category.description || `${category.name} ek prakar ki dukan hai jo aapko 8rupiya.com par mil sakti hai.`}\n\nAap apne area me ${category.name} dhundne ke liye mujhse pooch sakte hain!`;
        
        return {
          response: generateFriendlyResponse(userName, response),
          metadata: { category: category.name, categoryId: category._id },
        };
      }
    }
    
    // If no specific category or not found, show popular categories
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .limit(10);
    
    let response = 'Hamare paas ye categories hain:\n\n';
    categories.forEach((cat, index) => {
      response += `${index + 1}. ${cat.icon || ''} ${cat.name}\n`;
    });
    response += '\nAap koi bhi category ke baare me pooch sakte hain!';
    
    return {
      response: generateFriendlyResponse(userName, response),
      metadata: { categoriesShown: categories.length },
    };
  } catch (error: any) {
    console.error('Category processing error:', error);
    return {
      response: generateFriendlyResponse(userName, 'Maaf kijiye, categories fetch karne me problem ho rahi hai. Kripya phir se try karein.'),
      metadata: {},
    };
  }
}

// Process general queries using Google Search
async function processGeneralQuery(query: string, userName?: string) {
  try {
    // Try Google Search for general knowledge
    const searchResults = await googleSearch(query);
    
    if (searchResults && searchResults.length > 0) {
      const topResult = searchResults[0];
      let response = `${topResult.snippet}\n\n`;
      
      if (searchResults.length > 1) {
        response += 'Aur bhi information:\n';
        searchResults.slice(1, 3).forEach((result, index) => {
          response += `${index + 2}. ${result.title}\n`;
        });
      }
      
      response += '\n💡 Kya aur kuch janna chahte hain?';
      
      return {
        response: generateFriendlyResponse(userName, response),
        metadata: { source: 'google_search', resultsCount: searchResults.length },
      };
    }
    
    // Fallback if no search results
    return {
      response: generateFriendlyResponse(userName, 'Main aapki madad karne ke liye yahan hoon! Aap mujhse shops, categories, reminders, weather, ya kuch bhi pooch sakte hain.'),
      metadata: { source: 'fallback' },
    };
  } catch (error: any) {
    console.error('General query processing error:', error);
    return {
      response: generateFriendlyResponse(userName, 'Main aapki madad karne ke liye yahan hoon! Aap mujhse shops, categories, reminders, weather, ya kuch bhi pooch sakte hain.'),
      metadata: { source: 'error_fallback' },
    };
  }
}

