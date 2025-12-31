'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin/facebook', label: 'Dashboard', icon: '📊' },
  { href: '/admin/facebook/connection', label: 'Connection', icon: '🔗' },
  { href: '/admin/facebook/pages', label: 'Pages', icon: '📄' },
  { href: '/admin/facebook/reply-rules', label: 'Reply Rules', icon: '💬' },
  { href: '/admin/facebook/message-rules', label: 'Message Rules', icon: '📨' },
  { href: '/admin/facebook/events', label: 'Events', icon: '📡' },
  { href: '/admin/facebook/logs', label: 'Logs', icon: '📋' },
];

export default function FacebookNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/admin/facebook' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
