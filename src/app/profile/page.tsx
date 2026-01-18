import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'My Profile - 8rupiya.com',
  description: 'View and manage your profile on 8rupiya.com',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
