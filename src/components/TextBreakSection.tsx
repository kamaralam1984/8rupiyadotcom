'use client';

import { motion } from 'framer-motion';
import { FiInfo, FiHelpCircle } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

interface TextBreakSectionProps {
  title?: string;
  content?: string;
  variant?: 'info' | 'how-it-works' | 'reviews';
}

export default function TextBreakSection({ 
  title, 
  content,
  variant = 'info' 
}: TextBreakSectionProps) {
  const { t } = useLanguage();
  
  const defaultContent = {
    info: {
      title: t('textBreak.howItWorks'),
      text: t('textBreak.howItWorksText')
    },
    'how-it-works': {
      title: t('textBreak.findingRight'),
      text: t('textBreak.findingRightText')
    },
    reviews: {
      title: t('textBreak.reviewsMatter'),
      text: t('textBreak.reviewsMatterText')
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
          ) : variant === 'reviews' ? (
            <FiInfo className="text-2xl text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
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

