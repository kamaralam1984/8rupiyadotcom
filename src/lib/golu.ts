// GOLU AI Assistant Utility Functions

/**
 * Parse time from natural language input
 * Examples:
 * - "subah 5 baje" -> 05:00
 * - "sham 6 baje" -> 18:00
 * - "raat 10 baje" -> 22:00
 * - "dopahar 2 baje" -> 14:00
 */
export function parseTimeFromText(text: string): Date | null {
  const now = new Date();
  let hours = 0;
  let minutes = 0;

  // Clean up text
  text = text.toLowerCase().trim();

  // Pattern: "subah/sham/raat/dopahar X baje"
  const timePatterns = [
    // Hindi patterns
    { pattern: /subah\s+(\d+)\s*baje/i, modifier: 'morning' },
    { pattern: /sham\s+(\d+)\s*baje/i, modifier: 'evening' },
    { pattern: /raat\s+(\d+)\s*baje/i, modifier: 'night' },
    { pattern: /dopahar\s+(\d+)\s*baje/i, modifier: 'afternoon' },
    { pattern: /(\d+)\s*baje/i, modifier: 'default' },
    
    // English patterns
    { pattern: /(\d+)\s*am/i, modifier: 'am' },
    { pattern: /(\d+)\s*pm/i, modifier: 'pm' },
    { pattern: /(\d+):(\d+)\s*am/i, modifier: 'am' },
    { pattern: /(\d+):(\d+)\s*pm/i, modifier: 'pm' },
  ];

  for (const { pattern, modifier } of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      hours = parseInt(match[1]);
      minutes = match[2] ? parseInt(match[2]) : 0;

      // Apply modifiers
      if (modifier === 'morning' && hours <= 12) {
        // Morning: keep as is (5 = 5am)
      } else if (modifier === 'evening' && hours <= 12) {
        hours += 12; // 6 sham = 18:00
      } else if (modifier === 'night' && hours <= 12) {
        if (hours < 12) hours += 12; // 10 raat = 22:00
      } else if (modifier === 'afternoon') {
        if (hours < 12) hours += 12; // 2 dopahar = 14:00
      } else if (modifier === 'pm' && hours < 12) {
        hours += 12;
      }

      const targetTime = new Date(now);
      targetTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, set for tomorrow
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      return targetTime;
    }
  }

  return null;
}

/**
 * Parse medicine schedule from voice command
 * Examples:
 * - "10 baje Calpol"
 * - "Subah 8 baje BP ki dawa 1 tablet"
 * - "Raat me 10 baje sugar ki medicine 2 capsule"
 * - "Dopahar 2 baje liver ki dawa khali pet"
 */
export function parseMedicineSchedule(text: string): Array<{ 
  time: Date; 
  medicine: string; 
  dosage?: string;
  withFood?: boolean;
  frequency?: string;
}> {
  const medicines: Array<{ 
    time: Date; 
    medicine: string; 
    dosage?: string;
    withFood?: boolean;
    frequency?: string;
  }> = [];
  
  // Split by comma or 'aur'
  const parts = text.split(/,|aur/).map(p => p.trim());

  for (const part of parts) {
    // Try to extract time
    const time = parseTimeFromText(part);
    if (!time) continue;

    // Extract medicine name (supports Hindi and English)
    let medicine = '';
    const medicinePatterns = [
      /([A-Za-z]+)\s*(?:ki\s+dawa|ki\s+medicine|tablet|capsule)/i,
      /dawa\s+([A-Za-z]+)/i,
      /medicine\s+([A-Za-z]+)/i,
      /(Calpol|Paracetamol|Aspirin|Metformin|Insulin|Thyronorm|Ecosprin|BP|Sugar|Liver|Heart)/i,
    ];

    for (const pattern of medicinePatterns) {
      const match = part.match(pattern);
      if (match) {
        medicine = match[1].trim();
        break;
      }
    }

    if (!medicine) {
      // Fallback: extract any capitalized word or common medicine terms
      const words = part.split(/\s+/);
      for (const word of words) {
        if (/^[A-Z][a-z]+/i.test(word) && !/(baje|subah|sham|raat|dopahar|ki|dawa)/i.test(word)) {
          medicine = word;
          break;
        }
      }
    }

    // Extract dosage
    let dosage: string | undefined;
    const dosageMatch = part.match(/(\d+)\s*(tablet|capsule|drop|drops|spoon|ml|mg)/i);
    if (dosageMatch) {
      dosage = `${dosageMatch[1]} ${dosageMatch[2]}`;
    }

    // Check if with food
    const withFood = /(khane\s+ke\s+baad|after\s+food|with\s+food|khane\s+ke\s+saath)/i.test(part);
    const emptyStomach = /(khali\s+pet|empty\s+stomach|before\s+food|khane\s+se\s+pahle)/i.test(part);

    // Check frequency
    let frequency: string | undefined;
    if (/roz|daily|har\s+din|everyday/i.test(part)) {
      frequency = 'daily';
    } else if (/din\s+me\s+2\s+baar|twice|do\s+baar/i.test(part)) {
      frequency = 'twice-daily';
    } else if (/hafte|week|weekly/i.test(part)) {
      frequency = 'weekly';
    }

    if (time && medicine) {
      medicines.push({ 
        time, 
        medicine,
        dosage,
        withFood: emptyStomach ? false : withFood,
        frequency,
      });
    }
  }

  return medicines;
}

/**
 * Parse meeting reminder
 * Example: "3 baje meeting hai 10 minute pahle bata dena"
 */
export function parseMeetingReminder(text: string): { time: Date; notifyBeforeMinutes: number; title: string } | null {
  const timeMatch = text.match(/(\d+)\s*baje/i);
  const notifyMatch = text.match(/(\d+)\s*minute\s+pahle/i);

  if (timeMatch) {
    const time = parseTimeFromText(text);
    const notifyBeforeMinutes = notifyMatch ? parseInt(notifyMatch[1]) : 10;
    const title = 'Meeting';

    if (time) {
      return { time, notifyBeforeMinutes, title };
    }
  }

  return null;
}

/**
 * Detect command category from user input
 */
export function detectCommandCategory(text: string): string {
  const originalText = text;
  text = text.toLowerCase();
  
  // Debug log
  console.log('Detecting category for text:', text);

  // Profile/Personal Information keywords
  if (/(mera naam|my name|birthday|janamdin|call me|bula|rehta|city|shahar|live)/i.test(text)) {
    return 'PROFILE';
  }

  // Financial keywords (salary, rent, bills)
  if (/(salary|tankhuwa|aati|rent|dena|bill|light bill|bijli|electricity|paisa|paise)/i.test(text) && /(tareekh|tarikh|date|ko)/i.test(text)) {
    return 'FINANCIAL';
  }

  // Medical keywords (health conditions, medicines)
  if (/(sugar|diabetes|BP|blood pressure|thyroid|heart|dawa|medicine|health|sehat|doctor|checkup|bimari)/i.test(text)) {
    return 'MEDICAL';
  }

  // Family keywords
  if (/(mummy|papa|wife|biwi|husband|pati|bachcha|beta|beti|mother|father|family)/i.test(text) && /(dawa|yaad|reminder|medicine)/i.test(text)) {
    return 'FAMILY';
  }

  // Business/Sales keywords
  if (/(sale|sales|business|shop owner|kitni sale|customer|revenue)/i.test(text)) {
    return 'BUSINESS';
  }

  // Astrology/Jyotish keywords
  if (/(lucky|luck|kundli|jyotish|rashifal|bhagya|horoscope|shubh|achha din|lucky color)/i.test(text)) {
    return 'ASTROLOGY';
  }

  // Travel/Cab keywords
  if (/(jaana|jana|jaa|go to|cab|taxi|ola|uber|rapido|station|airport)/i.test(text)) {
    return 'TRAVEL';
  }

  // Reminder/Alarm keywords
  if (/(reminder|yaad|yaad dilana|bata dena|utha dena|alarm)/i.test(text)) {
    if (/dawa|medicine|tablet|capsule|syrup/i.test(text)) {
      return 'MEDICINE';
    }
    if (/meeting|call|appointment/i.test(text)) {
      return 'MEETING';
    }
    if (/utha|alarm|wake/i.test(text)) {
      return 'ALARM';
    }
    return 'REMINDER';
  }

  // Location/Maps keywords (Check BEFORE translation to avoid conflicts)
  // Priority: Location queries should be detected first
  if (/(kahan|where|distance|dur|nearby|paas|location|address|station|airport|hospital|school|college|market|mall|restaurant|hotel|address|pata|jagah|sthan)/i.test(text) && 
      !/(matlab|meaning|translate|hindi|english|bolo|arth)/i.test(text)) {
    return 'LOCATION';
  }

  // Translation keywords (Only if NOT a location query)
  if (/(translate|matlab|meaning|hindi|english|bolo|arth|ka\s+matlab)/i.test(text) && 
      !/(kahan|where|location|address|station|airport)/i.test(text)) {
    return 'TRANSLATION';
  }

  // Weather keywords - should be checked BEFORE time/date
  if (/(weather|mausam|temperature|barish|rain|garmi|thandi|thand|dhoop|barf|storm|toofan)/i.test(text)) {
    console.log('✅ Weather keyword detected!');
    return 'WEATHER';
  }

  // Category query keywords (what is X category, X category kya hai)
  if (/(category|categories|kya hai|what is|types of|kitne prakar|konsi dukan|shop type)/i.test(text) || 
      /(grocery|restaurant|hotel|parlour|gym|hospital|school|clinic|pharmacy|bakery|cafe)/i.test(text) && /(kya hai|what is|chahiye|dhund|find)/i.test(text)) {
    return 'CATEGORY';
  }

  // Shopping keywords (including nearby shop queries)
  if (/(shop|store|dukan|kharidna|buy|mall|market|sasta|cheapest|best price|nearby shop|paas.*shop|paas.*dukan|shop.*paas|dukan.*paas|shop.*connect|shop.*call|shop.*phone|shop.*contact)/i.test(text)) {
    return 'SHOPPING';
  }

  // Media/YouTube/Music keywords
  if (/(youtube|video|song|music|gana|gaana|sunao|sunaw|play|bajao|open youtube|on kro|chalao)/i.test(text)) {
    return 'MEDIA';
  }

  // Calculation keywords
  if (/(calculate|calculate karo|jod|guna|minus|plus|divide)/i.test(text)) {
    return 'CALCULATION';
  }

  // Time/Date keywords
  if (/(time|date|aaj|today|tomorrow|kal|din|mahina|year)/i.test(text)) {
    return 'TIME_DATE';
  }

  // News keywords
  if (/(news|khabar|samachar|latest)/i.test(text)) {
    return 'NEWS';
  }

  // Search keywords
  if (/(search|dhundo|kya hai|kaun hai|explain|bata|history|fact)/i.test(text)) {
    return 'SEARCH';
  }

  console.log('⚠️ No category matched, returning GENERAL');
  return 'GENERAL';
}

/**
 * Extract category name from query
 * Examples:
 * - "Grocery store kya hai" -> "Grocery"
 * - "What is a restaurant" -> "restaurant"
 * - "Mujhe bakery chahiye" -> "bakery"
 */
export function extractCategoryFromQuery(text: string): string | null {
  text = text.toLowerCase();
  
  // Common category keywords
  const categoryKeywords = [
    'grocery', 'kirana', 'restaurant', 'hotel', 'cafe', 'bakery',
    'pharmacy', 'medical', 'clinic', 'hospital', 'doctor',
    'salon', 'parlour', 'spa', 'gym', 'fitness',
    'school', 'college', 'coaching', 'tuition',
    'electronics', 'mobile', 'computer', 'hardware',
    'clothing', 'boutique', 'tailor', 'fashion',
    'jewellery', 'gold', 'silver',
    'taxi', 'cab', 'travel', 'tour',
    'bank', 'atm', 'finance',
  ];
  
  for (const keyword of categoryKeywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }
  
  // Try to extract from pattern "X kya hai" or "what is X"
  const patterns = [
    /([a-z]+)\s+kya\s+hai/i,
    /what\s+is\s+(?:a\s+)?([a-z]+)/i,
    /([a-z]+)\s+chahiye/i,
    /([a-z]+)\s+dhund/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Generate friendly Hinglish response
 */
export function generateFriendlyResponse(userName: string | undefined, response: string): string {
  const greetings = userName ? `${userName} ji, ` : '';
  return greetings + response;
}

/**
 * Calculate expression from text
 * Example: "2 plus 3" -> 5
 */
export function calculateFromText(text: string): number | null {
  try {
    // Replace Hindi/Hinglish operators
    text = text
      .replace(/jod|plus|aur/gi, '+')
      .replace(/minus|gata/gi, '-')
      .replace(/guna|multiply|into/gi, '*')
      .replace(/divide|bhag/gi, '/')
      .replace(/[^\d+\-*/().]/g, '');

    // Safely evaluate expression
    const result = Function('"use strict"; return (' + text + ')')();
    return typeof result === 'number' && !isNaN(result) ? result : null;
  } catch (error) {
    return null;
  }
}

/**
 * Format time for Indian style
 */
export function formatTimeIndian(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  let period = 'subah';
  let displayHours = hours;

  if (hours >= 12 && hours < 17) {
    period = 'dopahar';
    if (hours > 12) displayHours = hours - 12;
  } else if (hours >= 17 && hours < 21) {
    period = 'sham';
    displayHours = hours - 12;
  } else if (hours >= 21 || hours < 5) {
    period = 'raat';
    if (hours > 12) displayHours = hours - 12;
  }

  const minutesStr = minutes > 0 ? ` ${minutes} minute` : '';
  return `${period} ${displayHours} baje${minutesStr}`;
}

/**
 * Get current time/date in Indian style
 */
export function getCurrentTimeIndian(): string {
  const now = new Date();
  return formatTimeIndian(now);
}

/**
 * Get current date in Indian style
 */
export function getCurrentDateIndian(): string {
  const now = new Date();
  const days = ['Ravivaar', 'Somvaar', 'Mangalvaar', 'Budhvaar', 'Guruvaar', 'Shukravaar', 'Shanivaar'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return `Aaj ${days[now.getDay()]} hai, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

