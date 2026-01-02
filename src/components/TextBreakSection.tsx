'use client';

import { motion } from 'framer-motion';
import { FiInfo, FiHelpCircle } from 'react-icons/fi';

interface TextBreakSectionProps {
  title?: string;
  content?: string;
  variant?: 'info' | 'how-it-works';
}

export default function TextBreakSection({ 
  title, 
  content,
  variant = 'info' 
}: TextBreakSectionProps) {
  const defaultContent = {
    info: {
      title: "How 8rupiya.com Works",
      text: "Our platform makes it easy to discover and connect with local businesses. Simply browse through verified shops, read authentic customer reviews, and contact businesses directly. All listings are verified for accuracy, ensuring you get reliable information every time."
    },
    'how-it-works': {
      title: "Finding the Right Business for You",
      text: "Use our smart filters to narrow down your search by category, location, ratings, or specific services. Each business profile includes photos, contact details, operating hours, and customer reviews to help you make the best choice for your needs."
    }
  };

  const displayContent = {
    title: title || defaultContent[variant].title,
    text: content || defaultContent[variant].text
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="my-8 md:my-12"
    >
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl p-6 md:p-8 border border-blue-100 dark:border-gray-700">
        <div className="flex items-start gap-4">
          {variant === 'info' ? (
            <FiInfo className="text-2xl text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          ) : (
            <FiHelpCircle className="text-2xl text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {displayContent.title}
            </h3>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {displayContent.text}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

