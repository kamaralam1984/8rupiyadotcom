import { Metadata } from 'next';
import AboutUsClient from './AboutUsClient';

export const metadata: Metadata = {
  title: 'About Us - 8rupiya.com | India\'s Trusted Local Business Directory',
  description: 'Learn about 8rupiya.com - India\'s most trusted local business discovery platform. Find verified shops, restaurants, doctors, and services near you. Discover our mission, vision, and what makes us different.',
  keywords: 'about 8rupiya, local business directory India, shops near me, verified businesses, business discovery platform, local shops, restaurants near me, services in India',
  openGraph: {
    title: 'About Us - 8rupiya.com',
    description: 'India\'s most trusted local business discovery platform',
    type: 'website',
  },
};

export default function AboutUsPage() {
  return <AboutUsClient />;
}
