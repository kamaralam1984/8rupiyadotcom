import { Metadata } from 'next';
import ListYourBusinessClient from './ListYourBusinessClient';

export const metadata: Metadata = {
  title: 'List Your Business on 8rupiya.com - Free Business Listing | Get More Customers',
  description: 'List your business on 8rupiya.com for free and reach thousands of local customers. Increase visibility, get more customers, and grow your business. Simple step-by-step process to add your shop, restaurant, or service.',
  keywords: 'list business free, add shop online, business listing India, free business directory, list your shop, get more customers, local business visibility, shop registration, business listing benefits',
  openGraph: {
    title: 'List Your Business on 8rupiya.com - Free',
    description: 'Get more customers by listing your business for free on India\'s trusted local business directory',
    type: 'website',
  },
};

export default function ListYourBusinessPage() {
  return <ListYourBusinessClient />;
}
