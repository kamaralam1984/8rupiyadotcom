import { Metadata } from 'next';
import AdminLoginClient from '@/components/AdminLoginClient';

export const metadata: Metadata = {
  title: 'Admin Login - 8rupiya.com',
  description: 'Admin panel login for 8rupiya.com',
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}

