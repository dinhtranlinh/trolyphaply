'use client';

import Link from 'next/link';

interface PageCardProps {
  id: string;
  page_id: string;
  name: string;
  category: string;
  followers_count: number;
  automation_enabled: boolean;
  onToggle?: (enabled: boolean) => void;
  onDelete?: () => void;
}

export default function PageCard({
  id,
  page_id,
  name,
  category,
  followers_count,
  automation_enabled,
  onToggle,
  onDelete,
}: PageCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
            📄
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-xs text-gray-500 mt-1">ID: {page_id}</p>
          </div>
        </div>

        <button
          onClick={() => onToggle?.(!automation_enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            automation_enabled ? 'bg-green-500' : 'bg-gray-300'
          }`}
          title={automation_enabled ? 'Disable automation' : 'Enable automation'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              automation_enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Category:</span>
          <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
            {category}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Followers:</span>
          <span className="font-medium text-gray-900">
            {followers_count?.toLocaleString() || 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded ${
              automation_enabled
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {automation_enabled ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <Link
          href={`/admin/facebook/pages/${id}`}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
        >
          View Details
        </Link>
        <button
          onClick={onDelete}
          className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
