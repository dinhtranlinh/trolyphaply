'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Page {
  id: string;
  page_id: string;
  page_name: string;
}

interface MessageRule {
  id: string;
  page_id: string;
  name: string;
  trigger_on: string[];
  message_template: string;
  cooldown_minutes: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export default function MessageRulesPage() {
  const [rules, setRules] = useState<MessageRule[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load pages
      const pagesRes = await fetch('/api/facebook/pages');
      const pagesData = await pagesRes.json();
      if (pagesData.success) {
        setPages(pagesData.pages || []);
      }

      // Load rules
      const rulesUrl =
        selectedPage === 'all'
          ? '/api/facebook/message-rules'
          : `/api/facebook/message-rules?page_id=${selectedPage}`;

      const rulesRes = await fetch(rulesUrl);
      const rulesData = await rulesRes.json();

      if (rulesData.success) {
        setRules(rulesData.rules || []);
      } else {
        setMessage({ type: 'error', text: rulesData.error || 'Failed to load rules' });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/facebook/message-rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, enabled: !currentStatus } : r))
        );
        setMessage({
          type: 'success',
          text: `Rule ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update rule' });
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      setMessage({ type: 'error', text: 'Failed to update rule' });
    }
  };

  const deleteRule = async (ruleId: string, ruleName: string) => {
    if (!confirm(`Are you sure you want to delete rule "${ruleName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/facebook/message-rules/${ruleId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
        setMessage({ type: 'success', text: 'Rule deleted successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete rule' });
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
      setMessage({ type: 'error', text: 'Failed to delete rule' });
    }
  };

  const getPageName = (pageId: string) => {
    const page = pages.find((p) => p.page_id === pageId);
    return page?.page_name || pageId;
  };

  const getTriggerText = (triggerOn: string[]) => {
    if (triggerOn.includes('comment') && triggerOn.includes('reaction')) return 'Comment + Reaction';
    if (triggerOn.includes('comment')) return 'Comment Only';
    if (triggerOn.includes('reaction')) return 'Reaction Only';
    return 'None';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auto Message Rules</h1>
          <p className="text-sm text-gray-600 mt-1">
            Send inbox messages when users interact with your posts
          </p>
        </div>
        <Link
          href="/admin/facebook/message-rules/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <span>➕</span>
          Create New Rule
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Page:</label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Pages</option>
            {pages.map((page) => (
              <option key={page.id} value={page.page_id}>
                {page.page_name}
              </option>
            ))}
          </select>
          <div className="ml-auto text-sm text-gray-600">
            {rules.length} {rules.length === 1 ? 'rule' : 'rules'}
          </div>
        </div>
      </div>

      {/* Rules Table */}
      {rules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📨</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No message rules yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create your first auto-message rule to start sending inbox messages
            </p>
            <Link
              href="/admin/facebook/message-rules/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Create First Rule
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cooldown
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                        {rule.message_template.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getPageName(rule.page_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">
                        {getTriggerText(rule.trigger_on)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {rule.cooldown_minutes} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRule(rule.id, rule.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            rule.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/facebook/message-rules/${rule.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => deleteRule(rule.id, rule.name)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {rules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Rules</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{rules.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Active Rules</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {rules.filter((r) => r.enabled).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Comment Triggers</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {rules.filter((r) => r.trigger_on.includes('comment')).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
