'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft,
  FiMail,
  FiMessageSquare,
  FiHelpCircle,
  FiShoppingBag,
  FiSend,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import FooterMinimal from '@/components/FooterMinimal';

export default function ContactUsClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const contactReasons = [
    {
      icon: FiShoppingBag,
      title: 'List Your Business',
      description: 'Want to add your business to our directory? We\'re here to help you get started.',
      color: 'from-yellow-400 to-yellow-500'
    },
    {
      icon: FiMessageSquare,
      title: 'Advertising & Partnerships',
      description: 'Interested in advertising on 8rupiya.com or exploring partnership opportunities?',
      color: 'from-blue-400 to-blue-500'
    },
    {
      icon: FiHelpCircle,
      title: 'Support & Help',
      description: 'Have questions or need assistance? Our support team is ready to help you.',
      color: 'from-green-400 to-green-500'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Here you would typically send the form data to your API
      // For now, we'll simulate a submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, replace this with actual API call:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-blue-400/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-white bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Contact 8rupiya.com
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              We're here to help! Get in touch with us for business listings, advertising, support, or any inquiries.
            </motion.p>
          </motion.div>

          {/* Contact Reasons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mb-16"
          >
            {contactReasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300"
              >
                <div className={`p-3 rounded-lg bg-gradient-to-br ${reason.color} shadow-lg mb-4 inline-block`}>
                  <reason.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {reason.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {reason.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form & Email Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-yellow-400/20"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-yellow-400/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-yellow-400/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white/90 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-yellow-400/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                  >
                    <option value="">Select a subject</option>
                    <option value="business-listing">Business Listing</option>
                    <option value="advertising">Advertising & Partnerships</option>
                    <option value="support">Support & Help</option>
                    <option value="general">General Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-yellow-400/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400"
                  >
                    <FiCheckCircle className="text-xl" />
                    <span>Message sent successfully! We'll get back to you soon.</span>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400"
                  >
                    <FiAlertCircle className="text-xl" />
                    <span>Something went wrong. Please try again or email us directly.</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="text-xl" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Email & Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-yellow-400/20">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                  Get in Touch
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
                      <FiMail className="text-2xl text-gray-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
                      <a 
                        href="mailto:8rupiya@gmail.com" 
                        className="text-yellow-400 hover:text-yellow-300 text-lg font-medium transition-colors break-all"
                      >
                        8rupiya@gmail.com
                      </a>
                      <p className="text-white/70 mt-2">
                        We typically respond within 24-48 hours.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-yellow-400/20">
                    <h3 className="text-lg font-bold text-white mb-4">Why Contact Us?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <FiCheckCircle className="text-yellow-400 flex-shrink-0 mt-1" />
                        <span className="text-white/80">Need help listing your business? We'll guide you through the process.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FiCheckCircle className="text-yellow-400 flex-shrink-0 mt-1" />
                        <span className="text-white/80">Interested in advertising? Let's discuss partnership opportunities.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FiCheckCircle className="text-yellow-400 flex-shrink-0 mt-1" />
                        <span className="text-white/80">Have questions or feedback? We'd love to hear from you!</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FiCheckCircle className="text-yellow-400 flex-shrink-0 mt-1" />
                        <span className="text-white/80">Found an issue? Report it and we'll fix it promptly.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-2xl p-8 border border-yellow-400/30">
                <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link 
                    href="/list-your-business" 
                    className="block text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                  >
                    → List Your Business
                  </Link>
                  <Link 
                    href="/about-us" 
                    className="block text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                  >
                    → About Us
                  </Link>
                  <Link 
                    href="/" 
                    className="block text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                  >
                    → Home
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FooterMinimal />
    </div>
  );
}
