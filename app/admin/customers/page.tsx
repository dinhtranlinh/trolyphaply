'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Download,
  Edit,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';

interface Tag {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  tags: Tag[];
  created_at: string;
}

interface ImportResults {
  imported: number;
  skipped: number;
  errors: string[];
}

const buildImportPreview = (content: string) => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  let valid = 0;
  let invalid = 0;

  lines.forEach((line) => {
    const parts = line.split('|');
    const name = (parts[0] || '').trim();
    const phone = (parts.slice(1).join('|') || '').trim();
    if (name && phone) {
      valid += 1;
    } else {
      invalid += 1;
    }
  });

  return { total: lines.length, valid, invalid };
};

const copyText = async (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // fall through
    }
  }

  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch (err) {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
};

export default function CustomersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [error, setError] = useState('');

  const [tagInput, setTagInput] = useState('');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerMode, setCustomerMode] = useState<'create' | 'edit'>('create');
  const [customerForm, setCustomerForm] = useState({
    id: '',
    name: '',
    phone: '',
    tagIds: [] as string[]
  });

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importTagIds, setImportTagIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);

  const [gateStatus, setGateStatus] = useState<'checking' | 'required' | 'ok' | 'blocked'>(
    'checking'
  );
  const [gateError, setGateError] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [totpInput, setTotpInput] = useState('');
  const [verifyingGate, setVerifyingGate] = useState(false);

  const importPreview = useMemo(
    () => (importText ? buildImportPreview(importText) : { total: 0, valid: 0, invalid: 0 }),
    [importText]
  );

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    checkGate();
  }, [authorized]);

  useEffect(() => {
    if (!authorized || gateStatus !== 'ok') return;
    fetchTags();
  }, [authorized, gateStatus]);

  useEffect(() => {
    if (!authorized || gateStatus !== 'ok') return;
    fetchCustomers();
  }, [authorized, gateStatus, search, tagFilter]);

  const checkGate = async () => {
    try {
      setGateStatus('checking');
      const res = await fetch('/api/admin/customers/2fa/status', { cache: 'no-store' });
      const data = await res.json();
      if (res.status === 403) {
        router.push('/admin/dashboard');
        return;
      }
      if (res.ok && data.success) {
        setGateStatus(data.verified ? 'ok' : 'required');
        setGateError('');
      } else {
        setGateStatus('blocked');
        setGateError(data.error || 'Access denied');
      }
    } catch (err) {
      setGateStatus('blocked');
      setGateError('Access check failed');
    }
  };

  const fetchTags = async () => {
    try {
      setTagsLoading(true);
      const res = await fetch('/api/admin/customer-tags');
      const data = await res.json();
      if (res.status === 401) {
        setGateStatus('required');
        setGateError(data.error || 'Two-factor required');
        return;
      }
      if (res.status === 403) {
        router.push('/admin/dashboard');
        return;
      }
      if (res.ok && data.success) {
        setTags(data.data || []);
      } else {
        setError(data.error || 'Failed to load tags');
      }
    } catch (err) {
      setError('Failed to load tags');
    } finally {
      setTagsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (tagFilter !== 'all') params.set('tag', tagFilter);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();
      if (res.status === 401) {
        setGateStatus('required');
        setGateError(data.error || 'Two-factor required');
        return;
      }
      if (res.status === 403) {
        router.push('/admin/dashboard');
        return;
      }
      if (res.ok && data.success) {
        setCustomers(data.customers || []);
      } else {
        setError(data.error || 'Failed to load customers');
      }
    } catch (err) {
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    const name = tagInput.trim();
    if (!name) return;
    try {
      const res = await fetch('/api/admin/customer-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTagInput('');
        fetchTags();
      } else {
        alert(data.error || 'Failed to create tag');
      }
    } catch (err) {
      alert('Failed to create tag');
    }
  };

  const handleEditTag = async (tag: Tag) => {
    const nextName = prompt('Edit tag name', tag.name);
    if (!nextName || !nextName.trim() || nextName.trim() === tag.name) return;
    try {
      const res = await fetch(`/api/admin/customer-tags/${tag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nextName.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchTags();
        fetchCustomers();
      } else {
        alert(data.error || 'Failed to update tag');
      }
    } catch (err) {
      alert('Failed to update tag');
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    if (!confirm(`Delete tag "${tag.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/customer-tags/${tag.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchTags();
        fetchCustomers();
      } else {
        alert(data.error || 'Failed to delete tag');
      }
    } catch (err) {
      alert('Failed to delete tag');
    }
  };

  const openCreateCustomer = () => {
    setCustomerMode('create');
    setCustomerForm({ id: '', name: '', phone: '', tagIds: [] });
    setCustomerModalOpen(true);
  };

  const openEditCustomer = (customer: Customer) => {
    setCustomerMode('edit');
    setCustomerForm({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      tagIds: customer.tags.map((tag) => tag.id)
    });
    setCustomerModalOpen(true);
  };

  const toggleCustomerTag = (tagId: string) => {
    setCustomerForm((prev) => {
      const exists = prev.tagIds.includes(tagId);
      return {
        ...prev,
        tagIds: exists
          ? prev.tagIds.filter((id) => id !== tagId)
          : [...prev.tagIds, tagId]
      };
    });
  };

  const handleSaveCustomer = async () => {
    const name = customerForm.name.trim();
    const phone = customerForm.phone.trim();
    if (!name || !phone) {
      alert('Name and phone are required');
      return;
    }

    const payload = {
      name,
      phone,
      tagIds: customerForm.tagIds
    };

    try {
      const url =
        customerMode === 'create'
          ? '/api/admin/customers'
          : `/api/admin/customers/${customerForm.id}`;
      const method = customerMode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCustomerModalOpen(false);
        fetchCustomers();
      } else {
        alert(data.error || 'Failed to save customer');
      }
    } catch (err) {
      alert('Failed to save customer');
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`Delete customer "${customer.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchCustomers();
      } else {
        alert(data.error || 'Failed to delete customer');
      }
    } catch (err) {
      alert('Failed to delete customer');
    }
  };

  const handleCopyList = async () => {
    if (customers.length === 0) {
      alert('No customers to copy');
      return;
    }
    const lines = customers.map((customer) => `${customer.name}|${customer.phone}`).join('\n');
    const copied = await copyText(lines);
    if (copied) {
      alert('Copied list to clipboard');
    } else {
      alert('Failed to copy list');
    }
  };

  const handleCopyPhones = async () => {
    if (customers.length === 0) {
      alert('No customers to copy');
      return;
    }
    const lines = customers.map((customer) => customer.phone).join('\n');
    const copied = await copyText(lines);
    if (copied) {
      alert('Copied phones to clipboard');
    } else {
      alert('Failed to copy phones');
    }
  };

  const handleImportFileChange = (file: File | null) => {
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result || '').toString();
      setImportText(content);
      setImportResults(null);
    };
    reader.readAsText(file);
  };

  const toggleImportTag = (tagId: string) => {
    setImportTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      alert('Please select a TXT file');
      return;
    }
    if (importPreview.total > 2000) {
      alert('Max 2000 lines allowed');
      return;
    }
    setImporting(true);
    try {
      const res = await fetch('/api/admin/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: importText, tagIds: importTagIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportResults(data.results);
        fetchCustomers();
      } else {
        alert(data.error || 'Import failed');
      }
    } catch (err) {
      alert('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleVerifyGate = async () => {
    const pin = pinInput.trim();
    const code = totpInput.trim();
    if (!pin || !code) {
      setGateError('PIN and code are required');
      return;
    }

    setVerifyingGate(true);
    try {
      const res = await fetch('/api/admin/customers/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGateStatus('ok');
        setGateError('');
        setPinInput('');
        setTotpInput('');
      } else {
        setGateStatus('required');
        setGateError(data.error || 'Verification failed');
      }
    } catch (err) {
      setGateError('Verification failed');
    } finally {
      setVerifyingGate(false);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (gateStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (gateStatus !== 'ok') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900">
            {'X\u00e1c minh truy c\u1eadp'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {'Khu v\u1ef1c n\u00e0y y\u00eau c\u1ea7u PIN v\u00e0 m\u00e3 2FA.'}
          </p>

          {gateError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {gateError}
            </div>
          )}

          {gateStatus === 'required' && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600">{'M\u00e3 PIN'}</label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Enter PIN"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">2FA</label>
                <input
                  value={totpInput}
                  onChange={(e) => setTotpInput(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="123456"
                />
              </div>
              <button
                onClick={handleVerifyGate}
                disabled={verifyingGate}
                className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {verifyingGate ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          )}

          {gateStatus === 'blocked' && (
            <div className="mt-4 text-sm text-gray-600">
              {'Truy c\u1eadp b\u1ecb t\u1eeb ch\u1ed1i. Vui l\u00f2ng li\u00ean h\u1ec7 qu\u1ea3n tr\u1ecb vi\u00ean.'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Khach hang</h1>
        <p className="mt-1 text-gray-600">Quan ly tag va danh sach khach hang</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            className="float-right text-red-900 hover:text-red-700"
            onClick={() => setError('')}
          >
            x
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Tags */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="New tag"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={handleCreateTag}
              className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {tagsLoading && <div className="text-sm text-gray-500">Loading tags...</div>}
            {!tagsLoading && tags.length === 0 && (
              <div className="text-sm text-gray-500">No tags yet</div>
            )}
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                <span>{tag.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditTag(tag)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers */}
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={openCreateCustomer}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add customer
              </button>
              <button
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                Import TXT
              </button>
              <a
                href="/sample-customers.txt"
                download
                className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Sample file
              </a>
              <button
                onClick={handleCopyList}
                className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
                Copy list
              </button>
              <button
                onClick={handleCopyPhones}
                className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
                Copy so
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Tags</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-4 text-gray-500">
                      Loading customers...
                    </td>
                  </tr>
                )}
                {!loading && customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-gray-500">
                      No customers found
                    </td>
                  </tr>
                )}
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b">
                    <td className="py-3 pr-4 font-medium text-gray-900">{customer.name}</td>
                    <td className="py-3 pr-4 text-gray-700">{customer.phone}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {customer.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer modal */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">
              {customerMode === 'create' ? 'Add customer' : 'Edit customer'}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <input
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={customerForm.tagIds.includes(tag.id)}
                        onChange={() => toggleCustomerTag(tag.id)}
                      />
                      {tag.name}
                    </label>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-xs text-gray-500">No tags available</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setCustomerModalOpen(false)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Import customers</h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                x
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600">TXT file (name|phone)</label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleImportFileChange(e.target.files?.[0] || null)}
                  className="mt-2 block w-full text-sm text-gray-600"
                />
                {importFileName && (
                  <p className="mt-1 text-xs text-gray-500">Selected: {importFileName}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Apply tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={importTagIds.includes(tag.id)}
                        onChange={() => toggleImportTag(tag.id)}
                      />
                      {tag.name}
                    </label>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-xs text-gray-500">No tags available</span>
                  )}
                </div>
              </div>
              {importText && (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                  <p>Total lines: {importPreview.total}</p>
                  <p>Valid lines: {importPreview.valid}</p>
                  <p>Invalid lines: {importPreview.invalid}</p>
                </div>
              )}
              {importResults && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-xs text-green-700">
                  <p>Imported: {importResults.imported}</p>
                  <p>Skipped: {importResults.skipped}</p>
                  {importResults.errors.length > 0 && (
                    <div className="mt-2">
                      <p>Errors:</p>
                      <ul className="list-disc pl-4">
                        {importResults.errors.slice(0, 6).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
