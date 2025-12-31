'use client';

import Link from 'next/link';

interface Page {
  id: string;
  page_id: string;
  name: string;
  category: string;
  followers_count: number;
  automation_enabled: boolean;
}

interface PageTableProps {
  pages: Page[];
  onToggle?: (pageId: string, currentStatus: boolean) => void;
  onDelete?: (pageId: string, pageName: string) => void;
}

export default function PageTable({ pages, onToggle, onDelete }: PageTableProps) {
  if (pages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <span className="text-6xl mb-4 block">📄</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
          <p className="text-sm text-gray-600">
            Connect your Facebook account and sync your pages to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Followers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Automation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                      📄
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {page.name}
                      </div>
                      <div className="text-xs text-gray-500">ID: {page.page_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                    {page.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {page.followers_count?.toLocaleString() || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggle?.(page.id, page.automation_enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      page.automation_enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    title={
                      page.automation_enabled ? 'Disable automation' : 'Enable automation'
                    }
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        page.automation_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/facebook/pages/${page.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </Link>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => onDelete?.(page.id, page.name)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
