'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface Banner {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  buttonText?: string;
}

const banners: Banner[] = [
  {
    id: '1',
    title: 'Welcome to 8rupiya.com',
    description: 'Find the best shops near you',
    buttonText: 'Explore Now',
  },
  {
    id: '2',
    title: 'Discover Local Businesses',
    description: 'Connect with shop owners in your area',
    buttonText: 'Get Started',
  },
  {
    id: '3',
    title: 'Shop Smart, Shop Local',
    description: 'Support local businesses in your community',
    buttonText: 'Browse Shops',
  },
];

export default function BannerSlider() {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        className="rounded-2xl overflow-hidden shadow-2xl"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative h-64 md:h-96 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 text-center text-white px-6">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-bold mb-4"
                >
                  {banner.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-2xl mb-6"
                >
                  {banner.description}
                </motion.p>
                {banner.buttonText && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {banner.buttonText}
                  </motion.button>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

