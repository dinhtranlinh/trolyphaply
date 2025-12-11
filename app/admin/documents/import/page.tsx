'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ImportDocument {
  title: string;
  slug: string;
  type: string;
  documentNumber?: string;
  issuedBy: string;
  issuedDate: string;
  effectiveDate: string;
  category: string;
  tags: string[];
  summary?: string;
  content: string;
  chapters?: string[];
  source_urls?: string[];
}

interface ImportProcedure {
  title: string;
  slug: string;
  category: string;
  authority: string;
  level?: string;
  description?: string;
  estimatedTime: string;
  fees?: string;
  tags: string[];
  steps: any[];
}

interface ImportData {
  legalLibraryItems?: ImportDocument[];
  procedures?: ImportProcedure[];
}

interface ImportResults {
  documents: { imported: number; skipped: number; errors: string[] };
  procedures: { imported: number; skipped: number; errors: string[] };
}

export default function ImportLegalLibraryPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportData | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    setAuthorized(true);
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/json') {
      setError('Please upload a JSON file');
      return;
    }

    setFile(selectedFile);
    setError('');
    setResults(null);

    // Read and parse file for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data: ImportData = JSON.parse(content);
        setPreviewData(data);
      } catch (err) {
        setError('Invalid JSON format');
        setPreviewData(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!previewData) return;

    setError('');
    setImporting(true);

    try {
      const res = await fetch('/api/admin/legal-library/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResults(data.results);
        setFile(null);
        setPreviewData(null);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError('Failed to import data');
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    setResults(null);
    setError('');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Import Legal Library
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right text-red-900 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Section */}
        {!results && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload JSON File
            </h2>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {previewData && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload a JSON file containing legal documents and procedures data
            </p>
          </div>
        )}

        {/* Preview Section */}
        {previewData && !results && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Preview Import Data
            </h2>

            {/* Documents Preview */}
            {previewData.legalLibraryItems && previewData.legalLibraryItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  📜 Legal Documents ({previewData.legalLibraryItems.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Issued By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.legalLibraryItems.slice(0, 10).map((doc, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm text-gray-900">{doc.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{doc.type}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{doc.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{doc.issuedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.legalLibraryItems.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2 px-6">
                      ... and {previewData.legalLibraryItems.length - 10} more documents
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Procedures Preview */}
            {previewData.procedures && previewData.procedures.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  📋 Procedures ({previewData.procedures.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Authority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Time Est.
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.procedures.slice(0, 10).map((proc, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm text-gray-900">{proc.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{proc.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{proc.authority}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{proc.estimatedTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.procedures.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2 px-6">
                      ... and {previewData.procedures.length - 10} more procedures
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Import Button */}
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : 'Import Data'}
              </button>
              <button
                onClick={handleReset}
                disabled={importing}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Import Results
            </h2>

            {/* Documents Results */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                📜 Legal Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">
                    {results.documents.imported}
                  </div>
                  <div className="text-sm text-green-600">Imported</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-700">
                    {results.documents.skipped}
                  </div>
                  <div className="text-sm text-yellow-600">Skipped (Already Exists)</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-700">
                    {results.documents.errors.length}
                  </div>
                  <div className="text-sm text-red-600">Errors</div>
                </div>
              </div>
              {results.documents.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Error Details:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {results.documents.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Procedures Results */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                📋 Procedures
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">
                    {results.procedures.imported}
                  </div>
                  <div className="text-sm text-green-600">Imported</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-700">
                    {results.procedures.skipped}
                  </div>
                  <div className="text-sm text-yellow-600">Skipped (Already Exists)</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-700">
                    {results.procedures.errors.length}
                  </div>
                  <div className="text-sm text-red-600">Errors</div>
                </div>
              </div>
              {results.procedures.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Error Details:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {results.procedures.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link
                href="/admin/documents"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Documents
              </Link>
              <Link
                href="/admin/procedures"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                View Procedures
              </Link>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Import More
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
