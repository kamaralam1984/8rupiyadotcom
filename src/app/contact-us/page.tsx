import { Metadata } from 'next';
import ContactUsClient from './ContactUsClient';

export const metadata: Metadata = {
  title: 'Contact Us - 8rupiya.com | Get in Touch with Our Team',
  description: 'Contact 8rupiya.com for business listings, advertising, support, or any inquiries. Email us at 8rupiya@gmail.com or use our contact form. We\'re here to help!',
  keywords: 'contact 8rupiya, business listing support, advertise on 8rupiya, customer support, business inquiry, get in touch',
  openGraph: {
    title: 'Contact Us - 8rupiya.com',
    description: 'Get in touch with 8rupiya.com for business listings, support, or inquiries',
    type: 'website',
  },
};

export default function ContactUsPage() {
  return <ContactUsClient />;
}
