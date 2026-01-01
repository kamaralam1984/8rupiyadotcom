import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GoluConversation, { CommandCategory, ConversationType } from '@/models/GoluConversation';
import Reminder, { ReminderType, ReminderStatus } from '@/models/Reminder';
import Shop, { ShopStatus } from '@/models/Shop';
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
  searchYouTubeVideo,
} from '@/lib/google-apis';
import {
  getGeminiResponse,
  getContextualGeminiResponse,
  getEnhancedAIResponse,
  enhanceQueryWithAI,
} from '@/lib/gemini-ai';

// 🔥 NEW: Advanced GOLU System
import { getSystemPrompt } from '@/lib/goluSystemPrompt';
import { getPersonaPrompt, detectPersonaContext, type UserRole } from '@/lib/goluPersonas';
import { toneCorrect, adjustForContext, hasGoodTone } from '@/lib/toneCorrector';
import { getCachedReply, setCachedReply, shouldCache } from '@/lib/replyCache';

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
          
          // Fetch user's actual name from database
          try {
            // First try User model (most reliable)
            const { default: User } = await import('@/models/User');
            const userDoc = await User.findById(payload.userId);
            
            if (userDoc?.name) {
              userName = userDoc.name;
              console.log('GOLU: Found name from User model:', userName);
            }
            
            // Try UserProfile for nickname/fullName if User model doesn't have name
            if (!userName) {
              const userProfile = await UserProfile.findOne({ userId: payload.userId });
              if (userProfile?.nickName) {
                userName = userProfile.nickName;
                console.log('GOLU: Found nickname from UserProfile:', userName);
              } else if (userProfile?.fullName) {
                userName = userProfile.fullName;
                console.log('GOLU: Found fullName from UserProfile:', userName);
              }
            }
            
            // Final fallback based on role
            if (!userName) {
              userName = user.role === 'admin' ? 'Admin' :
                         user.role === 'agent' ? 'Agent' :
                         user.role === 'shopper' ? 'Shop Owner' :
                         user.role === 'operator' ? 'Operator' :
                         'Dost';
              console.log('GOLU: Using role-based name:', userName);
            }
            
            console.log('GOLU: Final userName before role append:', userName, 'Role:', user.role);
            
            // Don't add role title if userName is already a role
            const isRoleName = ['Admin', 'Agent', 'Shop Owner', 'Operator', 'Dost'].includes(userName);
            if (!isRoleName && user.role) {
              const roleTitle = user.role === 'admin' ? 'Admin' : 
                               user.role === 'agent' ? 'Agent' :
                               user.role === 'shopper' ? 'Shop Owner' :
                               user.role === 'operator' ? 'Operator' : '';
              if (roleTitle) {
                userName = `${userName} (${roleTitle})`;
              }
            }
            
            console.log('GOLU: Final authenticated as:', userName, 'with role', user.role);
          } catch (nameError) {
            console.error('GOLU: Error fetching user name:', nameError);
            userName = user.role === 'admin' ? 'Admin' : 'Dost';
          }
        }
      }
    } catch (authError) {
      // Auth failed but continue - some features will work without auth
      console.log('GOLU: Running without authentication');
    }

    // 🔥 NEW: Get user role for persona
    const userRole: UserRole = (user?.role as UserRole) || 'user';
    console.log('🎯 GOLU: User role detected:', userRole);

    // 🔥 NEW: Check cache first (FAST RESPONSE)
    if (shouldCache(query)) {
      const cachedReply = getCachedReply(query, userRole);
      if (cachedReply) {
        console.log('⚡ GOLU: Cache HIT - returning instant response');
        
        // Save to conversation history
        await GoluConversation.create({
          userId: user?.userId,
          sessionId,
          userQuery: query,
          botResponse: cachedReply,
          category: 'GENERAL' as CommandCategory,
          type: type as ConversationType,
          wasSuccessful: true,
          cached: true,
        }).catch(err => console.error('Failed to save cached conversation:', err));

        return NextResponse.json({
          success: true,
          response: cachedReply,
          category: 'GENERAL',
          cached: true,
          responseTime: Date.now() - startTime,
        });
      }
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

    // 🔥 NEW: Get persona context for this user type
    const personaPrompt = getPersonaPrompt(userRole);
    const contextualHint = detectPersonaContext(workingQuery, userRole);
    console.log('🎭 GOLU: Persona loaded for', userRole);

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

        case 'MEDIA':
          const mediaResult = await processMedia(workingQuery, userName);
          response = mediaResult.response;
          metadata = mediaResult.metadata;
          break;

        default:
          // For general queries, try AI first, then Google Search
          const generalResult = await processGeneralQuery(workingQuery, userName, user?.userId);
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

    // 🔥 NEW: Apply TONE CORRECTION (SECRET SAUCE!)
    console.log('🎨 GOLU: Original response:', response.substring(0, 100) + '...');
    
    // Check if tone is already good
    if (!hasGoodTone(response)) {
      console.log('⚠️  GOLU: Applying tone correction...');
      response = toneCorrect(response);
      
      // Apply context-specific adjustments
      response = adjustForContext(response, {
        isError: errorMessage !== undefined,
        isSuccess: wasSuccessful && !errorMessage,
        userName: userName,
      });
      
      console.log('✅ GOLU: Tone corrected:', response.substring(0, 100) + '...');
    } else {
      console.log('✅ GOLU: Tone already good!');
    }

    // Translate response back to user's language if needed
    let responseInUserLanguage = response;
    if (detectedLanguage !== 'hi' && detectedLanguage !== 'en') {
      const translation = await translateText(response, detectedLanguage);
      responseInUserLanguage = translation.translatedText;
    }

    // 🔥 NEW: Cache this response if appropriate
    if (shouldCache(query) && wasSuccessful && !errorMessage) {
      setCachedReply(query, responseInUserLanguage, userRole);
      console.log('💾 GOLU: Response cached for future use');
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

    console.log(`🎉 GOLU: Response complete in ${processingTimeMs}ms`);

    return NextResponse.json({
      success: true,
      response: responseInUserLanguage,
      originalResponse: response,
      category,
      detectedLanguage,
      metadata,
      conversationId,
      requiresAuth: !user && ['PROFILE', 'FINANCIAL', 'MEDICAL', 'FAMILY', 'BUSINESS'].includes(category),
      toneCorrected: !hasGoodTone(response),
      cached: false,
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

// Enhanced Location Processing with Gemini AI (Modern & Advanced)
async function processLocation(query: string, userLocation: any, userName?: string) {
  try {
    // Enhanced place name extraction
    let place = '';
    
    // Pattern 1: "Place kahan hai"
    const pattern1 = query.match(/([\w\s]+?)\s+(kahan|where|location|address)\s+(hai|hain|he)/i);
    if (pattern1) {
      place = pattern1[1].trim();
    } else {
      // Pattern 2: "kahan hai Place"
      const pattern2 = query.match(/(kahan|where|location|address)\s+(hai|hain|he)\s+(.+)/i);
      if (pattern2) {
        place = pattern2[3].trim();
      } else {
        // Pattern 3: Remove location keywords and get place name
        place = query.replace(/(kahan|where|dur|distance|hai|hain|he|paas|nearby|location|address|ka|ke|ki)/gi, '').trim();
      }
    }

    // Clean place name
    place = place.replace(/^(the|a|an)\s+/i, '').trim();

    if (!place || place.length < 2) {
      return {
        response: generateFriendlyResponse(userName, 'Kripya place ka naam bataiye. Jaise "Patna station kahan hai" ya "Gandhi Maidan kahan hai".'),
        metadata: { error: 'Place name not found' },
      };
    }

    // Get location data from Google Maps
    const locationData = await getLocationDetails(place);
    
    if (!locationData) {
      // Try with Gemini AI to understand the query better
      const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'gemini';
      if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
        try {
          const aiPrompt = `User ne pucha: "${query}". Ye location query hai. Agar "${place}" ek jagah/place hai to uska sahi naam suggest karo. Agar nahi hai to "NOT_A_PLACE" return karo.`;
          const aiResponse = await getGeminiResponse(aiPrompt, undefined, { temperature: 0.3, maxTokens: 100 });
          
          if (aiResponse.text && !aiResponse.text.includes('NOT_A_PLACE')) {
            const suggestedPlace = aiResponse.text.trim().replace(/["']/g, '');
            const retryLocation = await getLocationDetails(suggestedPlace);
            
            if (retryLocation) {
              return await formatLocationResponse(suggestedPlace, retryLocation, userLocation, userName);
            }
          }
        } catch (aiError) {
          console.error('AI location enhancement error:', aiError);
        }
      }

      return {
        response: generateFriendlyResponse(userName, `Maaf kijiye, main "${place}" ka location nahi dhund paya. Kripya sahi place ka naam bataiye. Jaise "Patna Junction", "Gandhi Maidan", etc.`),
        metadata: { place, error: 'Location not found' },
      };
    }

    // Format response with Gemini AI enhancement
    return await formatLocationResponse(place, locationData, userLocation, userName);
  } catch (error: any) {
    console.error('Location processing error:', error);
    return {
      response: generateFriendlyResponse(userName, 'Maaf kijiye, location fetch karne me problem ho rahi hai. Kripya phir se try karein.'),
      metadata: { error: error.message },
    };
  }
}

// Helper function to format location response with Gemini AI
async function formatLocationResponse(
  place: string,
  locationData: any,
  userLocation: any,
  userName?: string
): Promise<{ response: string; metadata: any }> {
  try {
    // Calculate distance if user location available
    let distanceInfo = '';
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const distance = await calculateDistance(
        { lat: userLocation.latitude, lng: userLocation.longitude },
        { lat: locationData.latitude, lng: locationData.longitude }
      );

      if (distance) {
        distanceInfo = ` Aap se ${distance.distance} dur hai, pahunchne me lagbhag ${distance.duration} lagega.`;
      }
    }

    // Build location context for Gemini AI
    const locationContext = {
      placeName: place,
      address: locationData.formattedAddress,
      coordinates: `${locationData.latitude}, ${locationData.longitude}`,
      distanceInfo: distanceInfo,
    };

    // Use Gemini AI to generate natural, helpful response
    const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'gemini';
    if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      try {
        const aiPrompt = `User ne pucha: "${place} kahan hai". Location details:
- Place: ${locationContext.placeName}
- Address: ${locationContext.address}
- Distance: ${locationContext.distanceInfo || 'Not available'}

Ek natural, helpful response Hinglish me do jo:
1. Place ka naam clearly batao
2. Complete address do
3. Distance info do (agar available hai)
4. Friendly aur conversational ho
5. Google Maps link suggest karo (agar possible ho)

Response Hinglish me do, natural aur helpful.`;

        const aiResponse = await getGeminiResponse(aiPrompt, undefined, { 
          temperature: 0.7, 
          maxTokens: 200 
        });

        if (aiResponse.confidence && aiResponse.confidence > 0.6) {
          // Add Google Maps link
          const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationData.latitude)},${encodeURIComponent(locationData.longitude)}`;
          const enhancedResponse = `${aiResponse.text}\n\n🗺️ [Google Maps pe dekho](${mapsLink})`;
          
          return {
            response: generateFriendlyResponse(userName, enhancedResponse),
            metadata: { 
              locationData, 
              distanceInfo: distanceInfo || null,
              aiEnhanced: true,
              mapsLink,
            },
          };
        }
      } catch (aiError) {
        console.error('AI location formatting error:', aiError);
        // Fall through to default response
      }
    }

    // Default response without AI
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationData.latitude)},${encodeURIComponent(locationData.longitude)}`;
    const defaultResponse = `${place} yahan hai:\n\n📍 ${locationData.formattedAddress}${distanceInfo}\n\n🗺️ [Google Maps pe dekho](${mapsLink})`;

    return {
      response: generateFriendlyResponse(userName, defaultResponse),
      metadata: { 
        locationData, 
        distanceInfo: distanceInfo || null,
        aiEnhanced: false,
        mapsLink,
      },
    };
  } catch (error: any) {
    console.error('Location formatting error:', error);
    // Fallback response
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationData.latitude)},${encodeURIComponent(locationData.longitude)}`;
    return {
      response: generateFriendlyResponse(userName, `${place} yahan hai: ${locationData.formattedAddress}\n\n🗺️ [Google Maps](${mapsLink})`),
      metadata: { locationData, mapsLink },
    };
  }
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

  // Support both NEXT_PUBLIC_ and non-prefixed keys
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
  
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
  try {
    await connectDB();
    
    // Extract business type/category from query
    let businessType = query
      .replace(/(shop|store|dukan|kahan|where|paas|nearby|hai|chahiye|dhund|find|search)/gi, '')
      .trim();
    
    // If business type is empty, try to extract from common patterns
    if (!businessType || businessType.length < 2) {
      const categoryMatch = query.match(/(grocery|kirana|restaurant|hotel|cafe|bakery|pharmacy|medical|clinic|hospital|salon|parlour|gym|fitness|electronics|mobile|computer|clothing|boutique|jewellery|bank|atm)/i);
      if (categoryMatch) {
        businessType = categoryMatch[1];
      }
    }

    // Build query for shops
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

    // Add category/name filter if business type found
    if (businessType && businessType.length >= 2) {
      mongoQuery.$or = [
        { category: { $regex: businessType, $options: 'i' } },
        { name: { $regex: businessType, $options: 'i' } },
      ];
    }

    // Add location-based query if user location available
    const hasValidCoords = userLocation && 
                          userLocation.latitude && 
                          userLocation.longitude &&
                          !isNaN(userLocation.latitude) && 
                          !isNaN(userLocation.longitude) &&
                          userLocation.latitude >= -90 && userLocation.latitude <= 90 &&
                          userLocation.longitude >= -180 && userLocation.longitude <= 180;

    if (hasValidCoords) {
      try {
        mongoQuery.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [userLocation.longitude, userLocation.latitude],
            },
            $maxDistance: 50000, // 50km radius
          },
        };
      } catch (geoError) {
        // If geospatial query fails, continue without it
        console.log('Geospatial query not available, using regular query');
      }
    }

    // Fetch shops
    let shops: any[] = [];
    try {
      shops = await Shop.find(mongoQuery)
        .select('name category address city phone location rating reviewCount _id')
        .limit(10)
        .lean();
    } catch (error: any) {
      // If $near query fails, try without it
      if (error.message?.includes('index') || error.message?.includes('near')) {
        delete mongoQuery.location;
        shops = await Shop.find(mongoQuery)
          .select('name category address city phone location rating reviewCount _id')
          .limit(10)
          .lean();
      } else {
        throw error;
      }
    }

    // Calculate distances if location available
    if (hasValidCoords && shops.length > 0) {
      const { calculateDistance } = await import('@/lib/location');
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
      // Sort by distance
      shops.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
    }

    // Limit to top 5 shops
    shops = shops.slice(0, 5);

    if (shops.length === 0) {
      return {
        response: generateFriendlyResponse(
          userName, 
          `Maaf kijiye, "${businessType || 'shop'}" ke liye aapke area me koi shop nahi mili. Aap kisi aur category ya area try kar sakte hain.`
        ),
        metadata: { businessType, userLocation: hasValidCoords ? 'available' : 'not_available' },
      };
    }

    // Format response with shop details and connection options
    let response = `${businessType ? `"${businessType}"` : 'Nearby'} ke liye maine ${shops.length} shop${shops.length > 1 ? 's' : ''} dhundi ${shops.length > 1 ? 'hain' : 'hai'}:\n\n`;
    
    shops.forEach((shop: any, index: number) => {
      response += `${index + 1}. **${shop.name}**\n`;
      response += `   📍 ${shop.address}, ${shop.city}\n`;
      if (shop.distance) {
        response += `   📏 ${shop.distance.toFixed(1)} km dur\n`;
      }
      if (shop.rating > 0) {
        response += `   ⭐ ${shop.rating.toFixed(1)} (${shop.reviewCount || 0} reviews)\n`;
      }
      if (shop.phone) {
        const phoneClean = shop.phone.replace(/[^0-9]/g, '');
        response += `   📞 Call: ${shop.phone}\n`;
        response += `   💬 WhatsApp: https://wa.me/${phoneClean}\n`;
      }
      response += `   🔗 Shop Link: /shops/${shop._id}\n\n`;
    });

    response += `Aap in shops se directly call ya WhatsApp kar sakte hain! Kisi shop ke baare me aur janna ho to bataiye.`;

    // Prepare metadata with connection info
    const shopResults = shops.map((shop: any) => ({
      _id: shop._id,
      name: shop.name,
      category: shop.category,
      address: shop.address,
      city: shop.city,
      phone: shop.phone,
      distance: shop.distance,
      rating: shop.rating,
      reviewCount: shop.reviewCount,
      callLink: shop.phone ? `tel:${shop.phone}` : null,
      whatsappLink: shop.phone ? `https://wa.me/${shop.phone.replace(/[^0-9]/g, '')}` : null,
      shopLink: `/shops/${shop._id}`,
    }));

    return {
      response: generateFriendlyResponse(userName, response),
      metadata: { 
        shopResults,
        businessType,
        userLocation: hasValidCoords ? 'available' : 'not_available',
        shopsFound: shops.length,
      },
    };
  } catch (error: any) {
    console.error('Shopping processing error:', error);
    return {
      response: generateFriendlyResponse(
        userName, 
        'Maaf kijiye, shops dhundne me thodi problem ho rahi hai. Kripya phir se try karein ya kisi specific category ka naam bataiye.'
      ),
      metadata: { error: error.message },
    };
  }
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

// Enhanced News Processing with AI (Modern & Advanced)
async function processNews(query: string, userName?: string) {
  try {
    // Extract category from query if mentioned
    let category = 'general';
    const categoryMatch = query.match(/(sports|technology|business|entertainment|health|science)/i);
    if (categoryMatch) {
      category = categoryMatch[1].toLowerCase();
    }

    const headlines = await getNewsHeadlines(category, 'in', 5);
    
    if (headlines.length === 0) {
      return {
        response: generateFriendlyResponse(userName, 'Maaf kijiye, abhi news nahi mil pa rahi hai. Kripya thodi der baad try karein.'),
        metadata: { category, error: 'No news found' },
      };
    }

    // Enhanced response with AI if available
    const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'gemini';
    let response = '';

    if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY && headlines.length > 0) {
      try {
        const newsSummary = headlines.slice(0, 3).map((n: any) => n.title).join(', ');
        const aiPrompt = `Summarize these news headlines in Hinglish in 2-3 sentences: ${newsSummary}`;
        const aiResponse = await getGeminiResponse(aiPrompt, undefined, { temperature: 0.5, maxTokens: 200 });
        
        if (aiResponse.confidence && aiResponse.confidence > 0.5) {
          response = `📰 Aaj ki top news:\n\n${aiResponse.text}\n\n`;
          response += `Aur bhi news:\n`;
          headlines.slice(0, 3).forEach((n: any, i: number) => {
            response += `${i + 1}. ${n.title}\n`;
          });
        } else {
          throw new Error('AI response low confidence');
        }
      } catch (aiError) {
        // Fallback to simple format
        const newsList = headlines.slice(0, 3).map((n: any, i: number) => `${i + 1}. ${n.title}`).join('\n');
        response = `📰 Aaj ki top news:\n\n${newsList}`;
      }
    } else {
      // Simple format without AI
      const newsList = headlines.slice(0, 3).map((n: any, i: number) => `${i + 1}. ${n.title}`).join('\n');
      response = `📰 Aaj ki top news:\n\n${newsList}`;
    }

    return {
      response: generateFriendlyResponse(userName, response),
      metadata: { newsResults: headlines, category, aiEnhanced: aiProvider === 'gemini' },
    };
  } catch (error: any) {
    console.error('News processing error:', error);
    return {
      response: generateFriendlyResponse(userName, 'Maaf kijiye, news fetch karne me problem ho rahi hai. Kripya phir se try karein.'),
      metadata: { error: error.message },
    };
  }
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

// Process media queries (YouTube, Music, Videos)
async function processMedia(query: string, userName?: string) {
  try {
    // Check if user wants to just open YouTube (not a specific video)
    const isGenericYouTubeOpen = /^(youtube|yt)\s*(open|on|khol|kholo|kro|kar|chalu|chala|karo)\s*(kro|kar|do|de)?$/i.test(query.trim());
    
    if (isGenericYouTubeOpen) {
      // User wants to open YouTube app/website
      return {
        response: generateFriendlyResponse(
          userName,
          `🎬 YouTube khol raha hoon...\n\nYouTube app ya browser me khulega!`
        ),
        metadata: { 
          type: 'open_external',
          url: 'https://www.youtube.com',
          action: 'open_youtube_external',
          openInNewTab: true
        },
      };
    }
    
    // Extract song/video name
    let searchQuery = query
      .replace(/(youtube|video|song|music|gana|gaana|sunao|sunaw|play|bajao|open|on|kro|kar|de|do|chalao|chala)/gi, '')
      .trim();
    
    // If no specific video name provided
    if (!searchQuery || searchQuery.length < 3) {
      return {
        response: generateFriendlyResponse(
          userName,
          `🎵 Koi gaana ya video bataiye.\n\nJaise: "Kesariya song sunao" ya "KGF trailer dikhao"`
        ),
        metadata: { 
          type: 'youtube_prompt',
          action: 'prompt_video_name'
        },
      };
    }

    // Search for video using YouTube Data API
    console.log(`🔍 Searching YouTube for: "${searchQuery}"`);
    const videoResult = await searchYouTubeVideo(searchQuery);
    
    if (videoResult && videoResult.videoId) {
      // API SUCCESS: Got video ID from YouTube Data API
      const videoId = videoResult.videoId;
      
      console.log(`✅ Found video: "${videoResult.title}" (ID: ${videoId})`);
      
      // Direct embed URL with autoplay (works best for direct play)
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      
      // YouTube app deep link (for mobile)
      const mobileUrl = `vnd.youtube://${videoId}`;
      
      // Standard watch URL (fallback for desktop)
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;
      
      let response = `🎵 "${videoResult.title}" play kar raha hoon...\n\n`;
      response += `📺 ${videoResult.channelTitle}`;

      return {
        response: generateFriendlyResponse(userName, response),
        metadata: { 
          searchQuery,
          videoId,
          videoTitle: videoResult.title,
          channelTitle: videoResult.channelTitle,
          thumbnail: videoResult.thumbnail,
          embedUrl,        // For iframe (best for direct play)
          mobileUrl,       // For YouTube app
          watchUrl,        // For browser
          type: 'youtube_video',
          action: 'play_youtube_video',
          openInNewTab: true
        },
      };
    } else {
      // API KEY MISSING: Use smart fallback with direct search to first video
      console.warn('⚠️ YouTube API not configured - using fallback search method');
      
      // Instead of search results page, redirect to search which auto-plays first video
      // This is better UX than showing search results
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}&sp=CAMSAhAB`;
      
      return {
        response: generateFriendlyResponse(
          userName,
          `🎵 "${searchQuery}" search kar ke first video play kar raha hoon...\n\n⚠️ Behtar results ke liye YouTube API key configure karein!`
        ),
        metadata: { 
          searchQuery,
          url: searchUrl,
          type: 'open_external',
          action: 'open_youtube_search',
          openInNewTab: true,
          note: 'Configure YouTube API key for direct video play'
        },
      };
    }
  } catch (error: any) {
    console.error('Media processing error:', error);
    return {
      response: generateFriendlyResponse(
        userName, 
        'Video play karne me problem ho rahi hai. Kripya phir se try karein.'
      ),
      metadata: { error: error.message },
    };
  }
}

// Process general queries using AI + Google Search (Modern & Advanced)
async function processGeneralQuery(query: string, userName?: string, userId?: any) {
  try {
    const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'gemini';
    
    // Step 1: Try Gemini AI first (if enabled)
    if (aiProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      try {
        // Get user context for better responses
        let userContext: any = {};
        if (userId) {
          const profile = await UserProfile.findOne({ userId });
          if (profile) {
            userContext = {
              name: profile.nickName || profile.fullName,
              location: profile.city || profile.state,
            };
          }
        }

        // Get AI response with context
        const aiResponse = await getContextualGeminiResponse(query, [], userContext);
        
        if (aiResponse.confidence && aiResponse.confidence > 0.6) {
          // Enhance with Google Search for additional context
          const searchResults = await googleSearch(query, 2);
          
          let enhancedResponse = aiResponse.text;
          
          if (searchResults && searchResults.length > 0) {
            enhancedResponse += '\n\n📚 Aur bhi information:\n';
            searchResults.slice(0, 2).forEach((result, index) => {
              enhancedResponse += `${index + 1}. ${result.title}\n`;
            });
          }
          
          return {
            response: generateFriendlyResponse(userName, enhancedResponse),
            metadata: { 
              source: 'gemini_ai', 
              confidence: aiResponse.confidence,
              searchResults: searchResults?.length || 0,
            },
          };
        }
      } catch (aiError: any) {
        console.error('Gemini AI error:', aiError);
        // Fall through to Google Search
      }
    }
    
    // Step 2: Fallback to Google Search
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
    
    // Step 3: Final fallback
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

