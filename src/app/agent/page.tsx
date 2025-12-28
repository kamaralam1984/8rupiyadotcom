'use client';

import { useState, useEffect } from 'react';
import AgentDashboard from '@/components/agent/AgentDashboard';
import AgentWorkDetailsPage from '@/components/agent/AgentWorkDetailsPage';

export default function Page() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUserRole(data.user.role || '');
          }
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // If admin, show agents work details page
  if (userRole === 'admin') {
    return <AgentWorkDetailsPage />;
  }

  // If agent, show agent dashboard
  return <AgentDashboard />;
}

