import AdminLayout from '@/components/admin/AdminLayout';
import UserManagementPage from '@/components/admin/UserManagementPage';

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <UserManagementPage />
    </AdminLayout>
  );
}

