// Gemini AI Integration for GOLU - Modern & Advanced Features

interface GeminiResponse {
  text: string;
  confidence?: number;
  reasoning?: string;
}

interface GeminiConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

/**
 * Get AI response from Gemini API
 * Modern implementation with advanced features
 */
export async function getGeminiResponse(
  prompt: string,
  context?: string,
  config: GeminiConfig = {}
): Promise<GeminiResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('Gemini API key not configured');
      return {
        text: 'AI service is currently unavailable. Please try again later.',
        confidence: 0,
      };
    }

    const {
      temperature = 0.7,
      maxTokens = 1024,
      topP = 0.95,
      topK = 40,
    } = config;

    // Build context-aware prompt
    const fullPrompt = context
      ? `Context: ${context}\n\nUser Query: ${prompt}\n\nProvide a helpful, accurate, and friendly response in Hinglish (Hindi + English mix) that's natural and conversational.`
      : `User Query: ${prompt}\n\nProvide a helpful, accurate, and friendly response in Hinglish (Hindi + English mix) that's natural and conversational.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt,
          }],
        }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP,
          topK,
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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      const finishReason = data.candidates[0].finishReason;
      
      return {
        text: text.trim(),
        confidence: finishReason === 'STOP' ? 0.9 : 0.7,
        reasoning: finishReason,
      };
    }

    return {
      text: 'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.',
      confidence: 0,
    };
  } catch (error: any) {
    console.error('Gemini AI error:', error);
    return {
      text: 'Maaf kijiye, AI service me thodi problem ho rahi hai. Kripya phir se try karein.',
      confidence: 0,
    };
  }
}

/**
 * Get smart AI response with conversation context
 * Advanced feature: Context-aware responses
 */
export async function getContextualGeminiResponse(
  query: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  userContext?: {
    name?: string;
    location?: string;
    preferences?: Record<string, any>;
  }
): Promise<GeminiResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return {
        text: 'AI service is currently unavailable.',
        confidence: 0,
      };
    }

    // Build context string
    let contextString = '';
    if (userContext) {
      if (userContext.name) {
        contextString += `User's name: ${userContext.name}. `;
      }
      if (userContext.location) {
        contextString += `User's location: ${userContext.location}. `;
      }
    }

    // Build conversation history
    const historyText = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${contextString}

Conversation History:
${historyText || 'No previous conversation'}

Current Query: ${query}

Provide a helpful, natural response in Hinglish that:
1. Is contextually aware of the conversation
2. Uses user's name if available
3. Is friendly and conversational
4. Provides accurate information
5. Is concise but complete`;

    return await getGeminiResponse(fullPrompt, undefined, {
      temperature: 0.8,
      maxTokens: 512,
    });
  } catch (error: any) {
    console.error('Contextual Gemini error:', error);
    return {
      text: 'Maaf kijiye, response generate karne me problem ho rahi hai.',
      confidence: 0,
    };
  }
}

/**
 * Enhanced AI response with fallback
 * Advanced feature: Multi-tier response system
 */
export async function getEnhancedAIResponse(
  query: string,
  category: string,
  fallbackResponse: string,
  context?: any
): Promise<string> {
  try {
    const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'gemini';
    
    if (aiProvider === 'gemini') {
      const geminiResponse = await getContextualGeminiResponse(query, [], context);
      
      if (geminiResponse.confidence && geminiResponse.confidence > 0.5) {
        return geminiResponse.text;
      }
    }
    
    // Fallback to default response
    return fallbackResponse;
  } catch (error) {
    console.error('Enhanced AI error:', error);
    return fallbackResponse;
  }
}

/**
 * Smart query enhancement using AI
 * Advanced feature: Query understanding and enhancement
 */
export async function enhanceQueryWithAI(
  query: string,
  detectedCategory: string
): Promise<{
  enhancedQuery: string;
  suggestedActions?: string[];
  confidence: number;
}> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return {
        enhancedQuery: query,
        confidence: 0,
      };
    }

    const prompt = `Analyze this user query and enhance it for better understanding:

Original Query: "${query}"
Detected Category: "${detectedCategory}"

Provide:
1. Enhanced/Clarified query
2. Suggested actions (if any)
3. Confidence level (0-1)

Format as JSON:
{
  "enhancedQuery": "...",
  "suggestedActions": ["..."],
  "confidence": 0.8
}`;

    const response = await getGeminiResponse(prompt, undefined, {
      temperature: 0.3,
      maxTokens: 256,
    });

    try {
      const parsed = JSON.parse(response.text);
      return {
        enhancedQuery: parsed.enhancedQuery || query,
        suggestedActions: parsed.suggestedActions,
        confidence: parsed.confidence || 0.7,
      };
    } catch {
      return {
        enhancedQuery: query,
        confidence: 0.7,
      };
    }
  } catch (error) {
    console.error('Query enhancement error:', error);
    return {
      enhancedQuery: query,
      confidence: 0,
    };
  }
}

