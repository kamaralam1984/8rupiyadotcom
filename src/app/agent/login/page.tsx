import { Metadata } from 'next';
import AgentLoginClient from '@/components/AgentLoginClient';

export const metadata: Metadata = {
  title: 'Agent Login - 8rupiya.com',
  description: 'Agent panel login for 8rupiya.com',
};

export default function AgentLoginPage() {
  return <AgentLoginClient />;
}

