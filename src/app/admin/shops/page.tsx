import { Suspense } from 'react';
import ShopsPage from '@/components/admin/ShopsPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>}>
      <ShopsPage />
    </Suspense>
  );
}

