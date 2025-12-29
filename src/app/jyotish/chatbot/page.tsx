'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaKeyboard, FaPaperPlane, FaUser, FaRobot, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'नमस्ते! मैं वेब पंडित हूं। मैं आपकी कैरियर, शादी, स्वास्थ्य, वित्त से जुड़े सवालों का जवाब दे सकता हूं। कृपया अपना सवाल पूछें।',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }

    return () => {
      // Cleanup: stop any ongoing speech
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Speak text using Web Speech API
  const speakText = (text: string, messageId: string) => {
    if (!speechSynthesisRef.current) return;

    // Stop any ongoing speech
    speechSynthesisRef.current.cancel();

    // Remove markdown formatting and emojis for cleaner speech
    const cleanText = text
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/#+\s/g, '') // Remove headers
      .replace(/•/g, '') // Remove bullets
      .replace(/[📈💫🎯💑✨🌸💰💵🏥🌿👨‍👩‍👧‍👦🙏🌟⭐]/g, '') // Remove emojis
      .replace(/\n+/g, '. ') // Replace newlines with pauses
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set voice properties
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to use Hindi voice if available
    const voices = speechSynthesisRef.current.getVoices();
    const hindiVoice = voices.find(voice => 
      voice.lang.includes('hi') || voice.name.includes('Hindi')
    );
    
    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN'; // Fallback to Indian English
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };

    speechSynthesisRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Auto-play voice if enabled
      if (autoPlayVoice) {
        setTimeout(() => {
          speakText(botResponse.text, botResponse.id);
        }, 500);
      }
    }, 2000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Career/Job related queries
    if (input.includes('career') || input.includes('नौकरी') || input.includes('job') || input.includes('करियर')) {
      return `🌟 **करियर विश्लेषण / Career Analysis**

आपकी कुंडली के अनुसार:

📈 **वर्तमान स्थिति:**
• सूर्य और बुध की युति से करियर में प्रगति के योग
• अगले 3 महीनों में नई संभावनाएं बनेंगी
• नौकरी बदलने का शुभ समय आने वाला है

💫 **शुभ योग:**
• शुक्रवार को पीले कपड़े पहनें
• सूर्य देव को जल चढ़ाएं
• प्रतिदिन गायत्री मंत्र का जाप करें

🎯 **सलाह:**
• आत्मविश्वास बनाए रखें
• नए अवसरों के लिए तैयार रहें
• कठिन परिश्रम जारी रखें`;
    }
    
    // Marriage related queries
    if (input.includes('marriage') || input.includes('शादी') || input.includes('vivah') || input.includes('विवाह')) {
      return `💑 **विवाह विश्लेषण / Marriage Analysis**

आपकी कुंडली में:

💕 **शुभ योग:**
• सप्तम भाव में शुक्र की स्थिति अनुकूल
• अगले 6-12 महीनों में विवाह के योग
• परिवार का सहयोग मिलेगा

✨ **उपाय:**
• गुरुवार को पीले वस्त्र धारण करें
• शुक्र ग्रह की पूजा करें
• माता पार्वती का आशीर्वाद लें

🌸 **सलाह:**
• धैर्य बनाए रखें
• परिवार की राय लें
• सही समय का इंतजार करें`;
    }

    // Health related queries
    if (input.includes('health') || input.includes('स्वास्थ्य') || input.includes('बीमारी')) {
      return `🏥 **स्वास्थ्य विश्लेषण / Health Analysis**

आपकी कुंडली में:

💪 **स्वास्थ्य स्थिति:**
• समग्र स्वास्थ्य अच्छा है
• छोटी-मोटी परेशानियां हो सकती हैं
• नियमित दिनचर्या आवश्यक

🌿 **उपाय:**
• प्रतिदिन सूर्य नमस्कार करें
• तुलसी का पानी पिएं
• योग और ध्यान करें

⚕️ **सलाह:**
• नियमित व्यायाम करें
• पौष्टिक भोजन लें
• पर्याप्त नींद लें`;
    }

    // Finance/Money related queries
    if (input.includes('finance') || input.includes('पैसा') || input.includes('money') || input.includes('धन') || input.includes('व्यापार') || input.includes('business')) {
      return `💰 **वित्तीय विश्लेषण / Finance Analysis**

आपकी कुंडली में:

📊 **वित्तीय स्थिति:**
• गुरु की दृष्टि से धन लाभ के योग
• निवेश के लिए शुभ समय
• व्यापार में वृद्धि की संभावना

💎 **उपाय:**
• गुरुवार को दान करें
• पीले चने की दाल का दान करें
• लक्ष्मी जी की पूजा करें

💡 **सलाह:**
• बुद्धिमानी से निवेश करें
• विशेषज्ञ की सलाह लें
• बचत करते रहें`;
    }

    // Lucky number query
    if (input.includes('lucky') || input.includes('लकी') || input.includes('भाग्यशाली') || input.includes('number')) {
      return `🎲 **भाग्यशाली संख्या / Lucky Numbers**

आपके लिए आज के लकी नंबर:

🌟 मुख्य नंबर: 7, 14, 21
💫 सहायक नंबर: 3, 9, 18
🎯 रंग: पीला, सफेद, लाल

शुभकामनाएं! 🍀`;
    }

    // Kundli generation
    if (input.includes('kundli') || input.includes('कुंडली') || input.includes('horoscope') || input.includes('राशिफल')) {
      return `📊 **कुंडली सेवा / Kundli Service**

हमारी कुंडली सेवा:

✅ संपूर्ण कुंडली विश्लेषण
✅ नवग्रहों की स्थिति
✅ 12 भावों का विवेचन
✅ दशा और अंतर्दशा
✅ PDF डाउनलोड

कृपया Kundli Generator पेज पर जाएं:
👉 /jyotish/kundli`;
    }

    // Expert consultation
    if (input.includes('expert') || input.includes('pandit') || input.includes('पंडित') || input.includes('ज्योतिषी') || input.includes('consultation')) {
      return `👨‍🏫 **विशेषज्ञ परामर्श / Expert Consultation**

हमारे expert astrologers:

⭐ FREE: Basic guidance
💎 SILVER: Detailed analysis (₹299)
👑 GOLD: Personal consultation (₹599)
💫 PREMIUM: Complete package (₹999)

Marketplace पर जाएं:
👉 /jyotish/marketplace`;
    }

    // Default welcome message
    return `🙏 **नमस्ते! Welcome to AI Jyotish**

मैं आपकी सहायता के लिए यहां हूं। आप पूछ सकते हैं:

💼 **करियर:** नौकरी, प्रमोशन, व्यवसाय
💑 **विवाह:** शादी, रिश्ते, प्रेम
🏥 **स्वास्थ्य:** तबीयत, उपचार
💰 **वित्त:** पैसा, निवेश, धन
🎲 **भाग्य:** लकी नंबर, शुभ मुहूर्त
📊 **कुंडली:** जन्म कुंडली, राशिफल

कृपया अपना सवाल पूछें! 🌟`;
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
    if (!isRecording) {
      setTimeout(() => {
        setInputText('मेरी कुंडली में शादी के योग कब बन रहे हैं?');
        setIsRecording(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-green-900/20">
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-yellow-500/30 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/jyotish" className="flex items-center space-x-3">
              <img 
                src="/uploads/jyotish-logo.png" 
                alt="8rupiya AI Jyotish Platform" 
                className="h-10 md:h-12 w-auto drop-shadow-lg" 
              />
              <div className="ml-3">
                <h1 className="text-lg md:text-xl font-bold text-yellow-400">AI Chatbot</h1>
                <p className="text-xs text-gray-400">24/7 Available</p>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
              {/* Auto-play Voice Toggle */}
              <button
                onClick={() => {
                  setAutoPlayVoice(!autoPlayVoice);
                  if (isSpeaking) stopSpeaking();
                }}
                className={`px-3 py-1 rounded-full border transition-all flex items-center space-x-2 ${
                  autoPlayVoice
                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                    : 'bg-gray-700/20 border-gray-500/50 text-gray-400'
                }`}
                title={autoPlayVoice ? 'Auto-play Voice: ON' : 'Auto-play Voice: OFF'}
              >
                {autoPlayVoice ? <FaVolumeUp className="text-sm" /> : <FaVolumeMute className="text-sm" />}
                <span className="text-xs hidden md:inline">
                  {autoPlayVoice ? 'Voice ON' : 'Voice OFF'}
                </span>
              </button>
              
              <div className="px-3 py-1 bg-green-500/20 rounded-full border border-green-500/50">
                <span className="text-green-400 text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-r from-amber-400 to-orange-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <FaUser className="text-white" />
                    ) : (
                      <FaRobot className="text-black" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="relative">
                    <div className={`rounded-2xl p-4 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-800/90 backdrop-blur-xl border border-yellow-500/30 text-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {/* Voice Button for Bot Messages */}
                        {message.sender === 'bot' && (
                          <button
                            onClick={() => {
                              if (currentSpeakingId === message.id) {
                                stopSpeaking();
                              } else {
                                speakText(message.text, message.id);
                              }
                            }}
                            className={`ml-3 p-2 rounded-full transition-all ${
                              currentSpeakingId === message.id
                                ? 'bg-yellow-500 text-black animate-pulse'
                                : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40'
                            }`}
                            title={currentSpeakingId === message.id ? 'Stop Voice' : 'Play Voice'}
                          >
                            {currentSpeakingId === message.id ? (
                              <FaVolumeMute className="text-sm" />
                            ) : (
                              <FaVolumeUp className="text-sm" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 flex items-center justify-center">
                  <FaRobot className="text-black" />
                </div>
                <div className="bg-gray-800/90 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* AI Wazm Corncepts */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-t border-yellow-500/30 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-3">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                AI Published 24 checkering - Offline
              </span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-900/90 backdrop-blur-xl border-t border-yellow-500/50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              {/* Voice Button */}
              <button
                onClick={handleVoiceInput}
                className={`p-4 rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50'
                }`}
              >
                <FaMicrophone className="text-white text-xl" />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="कृपया अपना प्रश्न पूछें..."
                  className="w-full px-6 py-4 bg-gray-800/90 border border-yellow-500/30 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-yellow-400 transition-colors">
                  <FaKeyboard className="text-xl" />
                </button>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="p-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FaPaperPlane className="text-white text-xl" />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['करियर सलाह', 'शादी योग', 'आज का राशिफल', 'लकी नंबर'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputText(suggestion)}
                  className="px-4 py-2 bg-gray-800/70 border border-yellow-500/30 rounded-full text-sm text-gray-300 hover:bg-gray-700/70 hover:text-yellow-400 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

