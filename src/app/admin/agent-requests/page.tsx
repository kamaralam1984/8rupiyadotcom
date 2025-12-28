import AdminLayout from '@/components/admin/AdminLayout';
import AgentRequestsPage from '@/components/admin/AgentRequestsPage';
import { Suspense } from 'react';

export default function AdminAgentRequestsPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>}>
        <AgentRequestsPage />
      </Suspense>
    </AdminLayout>
  );
}

