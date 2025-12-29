'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaKeyboard, FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    }, 2000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('career') || input.includes('नौकरी') || input.includes('job')) {
      return '227+ met the new nCpqute, offering ancestrally convert's chat tool merrruch & mid पड्डे year rgettt 7888\n\nआपकी कुंडली के अनुसार, आने वाले 3 महीनों में करियर में अच्छी प्रगति होगी। शुक्रवार को पीले कपड़े पहनें।';
    }
    
    if (input.includes('marriage') || input.includes('शादी') || input.includes('vivah')) {
      return 'Alle vepaar aanstuur oltkomme vauu je quut? \n2Akjo resaurqates heur deposrt for hsitspit & citrah with user no hispun ses flexow\n\nआपकी कुंडली में शादी के योग बन रहे हैं। अगले 6 महीनों में अच्छी खबर मिल सकती है।';
    }

    if (input.includes('health') || input.includes('स्वास्थ्य')) {
      return 'स्वास्थ्य के लिए सूर्य नमस्कार करें और तुलसी का पानी पिएं। आपकी कुंडली में स्वास्थ्य अच्छा है।';
    }

    if (input.includes('finance') || input.includes('पैसा') || input.includes('money')) {
      return 'वित्तीय स्थिति में सुधार होगा। गुरुवार को दान करें। निवेश से पहले सलाह लें।';
    }

    return 'कृपया अपना प्रश्न विस्तार से पूछें। मैं आपकी मदद करने के लिए यहां हूं। आप करियर, शादी, स्वास्थ्य या वित्त के बारे में पूछ सकते हैं।';
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 flex items-center justify-center">
                <FaRobot className="text-2xl text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-yellow-400">Web Pandit</h1>
                <p className="text-sm text-gray-400">Wazered aabjoy</p>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
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
                  <div className={`rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-800/90 backdrop-blur-xl border border-yellow-500/30 text-gray-200'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {message.timestamp.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
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

