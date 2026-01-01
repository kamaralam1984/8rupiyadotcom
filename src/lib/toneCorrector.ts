/**
 * GOLU Tone Corrector - AUTO BHAI-MODE FILTER
 * Converts any AI response into perfect GOLU bhai-style
 * This is the SECRET SAUCE 🔥
 */

/**
 * Banned phrases that make GOLU sound robotic
 * These will be removed or replaced
 */
const BANNED_PHRASES = [
  'As an AI',
  'as an ai',
  'I cannot',
  'I am unable',
  'I\'m unable',
  'According to',
  'I apologize',
  'I don\'t have the ability',
  'I\'m just a',
  'As a language model',
  'I don\'t have access',
  'Unfortunately, I cannot',
  'I\'m sorry, but I cannot',
];

/**
 * Robotic words to replace with bhai-style equivalents
 */
const ROBOTIC_TO_BHAI: Record<string, string> = {
  'Unfortunately': 'Dekh bhai',
  'However': 'Lekin',
  'Therefore': 'Isliye',
  'Additionally': 'Aur',
  'Furthermore': 'Aur haan',
  'Nevertheless': 'Phir bhi',
  'Subsequently': 'Uske baad',
  'Consequently': 'Toh',
  'Moreover': 'Aur',
  'Indeed': 'Sach me',
  'Perhaps': 'Shayad',
  'Certainly': 'Bilkul',
  'Absolutely': 'Bilkul',
  'Please note': 'Yaad rakho',
  'It is important': 'Zaroori hai',
  'You should': 'Tum',
  'I recommend': 'Main suggest karta hun',
  'I suggest': 'Main bolunga',
};

/**
 * Main tone correction function
 * Converts formal AI response → GOLU bhai-style
 */
export function toneCorrect(text: string): string {
  let output = text;

  // Step 1: Remove banned phrases
  BANNED_PHRASES.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    output = output.replace(regex, '');
  });

  // Step 2: Replace robotic words
  Object.entries(ROBOTIC_TO_BHAI).forEach(([robotic, bhai]) => {
    const regex = new RegExp(`\\b${robotic}\\b`, 'gi');
    output = output.replace(regex, bhai);
  });

  // Step 3: Remove excessive punctuation
  output = output
    .replace(/\.{3,}/g, '...') // Max 3 dots
    .replace(/!{2,}/g, '!');    // Max 1 exclamation

  // Step 4: Ensure starts with reassurance (if not already)
  const hasGoodStart = 
    output.toLowerCase().startsWith('haan') ||
    output.toLowerCase().startsWith('dekh') ||
    output.toLowerCase().startsWith('achha') ||
    output.toLowerCase().startsWith('suno') ||
    output.toLowerCase().startsWith('theek');

  if (!hasGoodStart && !output.toLowerCase().includes('bhai')) {
    output = 'haan bhai, ' + output;
  }

  // Step 5: Ensure ends with confidence
  const hasGoodEnd = 
    output.endsWith('👊') ||
    output.endsWith('✅') ||
    output.endsWith('🔥') ||
    output.toLowerCase().includes('ho jayega') ||
    output.toLowerCase().includes('kar loge') ||
    output.toLowerCase().includes('sahi hai');

  if (!hasGoodEnd) {
    // Add random confidence ending
    const endings = [
      ' 👊',
      ' Ho jayega bhai ✅',
      ' Tum sahi ja rahe ho 👊',
      ' Tension mat lo 🔥',
    ];
    output += endings[Math.floor(Math.random() * endings.length)];
  }

  // Step 6: Clean up multiple spaces
  output = output.replace(/\s{2,}/g, ' ').trim();

  // Step 7: Ensure "bhai" appears at least once
  if (!output.toLowerCase().includes('bhai')) {
    // Insert "bhai" naturally after first sentence
    const firstPeriod = output.indexOf('.');
    if (firstPeriod > 0 && firstPeriod < output.length - 1) {
      output = 
        output.slice(0, firstPeriod + 1) + 
        ' Dekh bhai,' + 
        output.slice(firstPeriod + 1);
    }
  }

  return output;
}

/**
 * Check if response has good GOLU tone
 * Returns true if tone is already good
 */
export function hasGoodTone(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Check for bhai-style indicators
  const goodIndicators = [
    'bhai',
    'dekh',
    'simple bolun to',
    'tension mat',
    'ho jayega',
    'sahi hai',
    'kar loge',
  ];

  const hasIndicator = goodIndicators.some(ind => lowerText.includes(ind));
  
  // Check for bad indicators
  const hasBanned = BANNED_PHRASES.some(phrase => 
    lowerText.includes(phrase.toLowerCase())
  );

  return hasIndicator && !hasBanned;
}

/**
 * Add context-specific tone adjustments
 */
export function adjustForContext(text: string, context: {
  isError?: boolean;
  isSuccess?: boolean;
  isWaiting?: boolean;
  userName?: string;
}): string {
  let output = text;

  // Personalize with user name if available
  if (context.userName && !output.includes(context.userName)) {
    output = output.replace(/bhai/i, `${context.userName} bhai`);
  }

  // Error context - extra reassurance
  if (context.isError) {
    if (!output.toLowerCase().includes('tension')) {
      output = 'Koi tension nahi bhai. ' + output;
    }
    if (!output.toLowerCase().includes('common')) {
      output += ' Ye common issue hai, solve ho jayega.';
    }
  }

  // Success context - celebration
  if (context.isSuccess) {
    if (!output.toLowerCase().includes('perfect') && !output.toLowerCase().includes('shabash')) {
      output = 'Perfect bhai! ' + output;
    }
  }

  // Waiting context - set expectations
  if (context.isWaiting) {
    if (!output.toLowerCase().includes('wait') && !output.toLowerCase().includes('time')) {
      output += ' Thoda wait karna padega, lekin ho jayega.';
    }
  }

  return output;
}

/**
 * Emergency fallback for completely robotic responses
 */
export function emergencyBhaiMode(text: string): string {
  return `haan bhai, simple bolun to - ${text}. Samajh gaye na? Koi doubt ho toh batao 👊`;
}

