import OperatorLayout from '@/components/operator/OperatorLayout';
import OperatorAgentsPage from '@/components/operator/OperatorAgentsPage';
import { Suspense } from 'react';

export default function AgentsPage() {
  return (
    <OperatorLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div></div>}>
        <OperatorAgentsPage />
      </Suspense>
    </OperatorLayout>
  );
}

