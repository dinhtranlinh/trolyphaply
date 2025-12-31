import { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FacebookNav from '@/components/facebook/FacebookNav';
import ConnectionStatus from '@/components/facebook/ConnectionStatus';

export const metadata: Metadata = {
  title: 'Facebook Automation - Admin',
  description: 'Manage Facebook Page automation for TroLyPhapLy',
};

export default async function FacebookAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin authentication
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/dashboard" 
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Admin
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">
                Facebook Automation
              </h1>
            </div>
            
            {/* Connection Status Badge */}
            <ConnectionStatus />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <FacebookNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
