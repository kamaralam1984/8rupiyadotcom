import { Metadata } from 'next';
import ShopperLoginClient from '@/components/ShopperLoginClient';

export const metadata: Metadata = {
  title: 'Shopper Login - 8rupiya.com',
  description: 'Shopper panel login for 8rupiya.com',
};

export default function ShopperLoginPage() {
  return <ShopperLoginClient />;
}

