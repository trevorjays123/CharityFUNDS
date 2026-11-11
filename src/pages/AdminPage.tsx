import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Check,
  FolderOpen,
  HandCoins,
  HelpCircle,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import type { Category, Campaign, Faq, Inquiry, Withdrawal } from '../lib/types';
import { formatDate, formatMoney } from '../lib/format';

interface AdminStats {
  totalRaised: number;
  donationCount: number;
  donorCount: number;
  campaignCount: number;
  pendingCount: number;
  pendingWithdrawals: number;
}

interface AdminData {
  campaigns: Campaign[];
  withdrawals: (Withdrawal & { campaigns?: { title: string } | { title: string }[] | null })[];
  inquiries: Inquiry[];
  categories: Category[];
  faqs: Faq[];
  stats: AdminStats;
}

type Tab = 'overview' | 'campaigns' | 'withdrawals' | 'inquiries' | 'categories' | 'faqs';

const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-api`;

async function adminFetch(options: RequestInit) {
  const res = await fetch(apiUrl, {
    ...options,
    headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

export function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

  const load = useCallback(async () => {
    try {
      const body = await adminFetch({ method: 'GET' });
      setData(body);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, payload: Record<string, unknown>) => {
    setBusyId(id);
    try {
      await adminFetch({ method: 'POST', body: JSON.stringify(payload) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-stone-900">Admin panel unavailable</h1>
        <p className="mt-2 text-stone-600">{error}</p>
        <button onClick={load} className="mt-6 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;
  const { stats, campaigns, withdrawals, inquiries, categories } = data;

  const tabs: { key: Tab; label: string; icon: typeof BarChart3; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'campaigns', label: 'Campaigns', icon: FolderOpen, badge: stats.pendingCount },
    { key: 'withdrawals', label: 'Withdrawals', icon: HandCoins, badge: stats.pendingWithdrawals },
    { key: 'inquiries', label: 'Inquiries', icon: Inbox, badge: inquiries.filter((i) => !i.handled).length },
    { key: 'categories', label: 'Categories', icon: Plus },
    { key: 'faqs', label: 'FAQs', icon: HelpCircle, badge: undefined },
  ];

  return (
    <div className="bg-stone-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-stone-900">Admin panel</h1>
        <p className="mt-1 text-sm text-stone-600">Manage campaigns, payouts, and site content.</p>

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-stone-200">
          {tabs.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === key ? 'border-primary-600 text-primary-700' : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {badge ? <span className="rounded-full bg-accent-400 px-2 py-0.5 text-[11px] font-bold text-primary-950">{badge}</span> : null}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total raised', value: formatMoney(stats.totalRaised) },
                { label: 'Donations', value: String(stats.donationCount) },
                { label: 'Unique donors', value: String(stats.donorCount) },
                { label: 'Campaigns', value: String(stats.campaignCount) },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{s.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-stone-900">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setTab('campaigns')}
                className="rounded-2xl border border-accent-200 bg-accent-50 p-5 text-left transition-shadow hover:shadow-md"
              >
                <p className="font-semibold text-accent-800">{stats.pendingCount} campaign(s) awaiting approval</p>
                <p className="mt-1 text-sm text-accent-700">Review and approve new submissions →</p>
              </button>
              <button
                onClick={() => setTab('withdrawals')}
                className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-left transition-shadow hover:shadow-md"
              >
                <p className="font-semibold text-primary-800">{stats.pendingWithdrawals} withdrawal request(s) pending</p>
                <p className="mt-1 text-sm text-primary-700">Process organizer payouts →</p>
              </button>
            </div>
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 hidden md:table-cell">Raised / Goal</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-stone-900">{c.title}</p>
                      <p className="text-xs text-stone-500">
                        {c.categories?.name ?? 'Uncategorized'} · by {c.creator_name} · {formatDate(c.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          c.status === 'approved'
                            ? 'bg-primary-100 text-primary-700'
                            : c.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.featured && (
                        <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-1 text-xs font-semibold text-accent-700">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="font-semibold text-primary-700">{formatMoney(c.raised_amount)}</span>
                      <span className="text-stone-400"> / {formatMoney(c.goal_amount)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {busyId === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                        ) : (
                          <>
                            {c.status !== 'approved' && (
                              <button
                                onClick={() => act(c.id, { action: 'set_campaign_status', id: c.id, status: 'approved' })}
                                title="Approve"
                                className="rounded-lg bg-primary-100 p-2 text-primary-700 hover:bg-primary-200"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            {c.status !== 'rejected' && (
                              <button
                                onClick={() => act(c.id, { action: 'set_campaign_status', id: c.id, status: 'rejected' })}
                                title="Reject"
                                className="rounded-lg bg-amber-100 p-2 text-amber-700 hover:bg-amber-200"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => act(c.id, { action: 'toggle_featured', id: c.id, featured: !c.featured })}
                              title={c.featured ? 'Unfeature' : 'Feature'}
                              className={`rounded-lg p-2 ${c.featured ? 'bg-accent-100 text-accent-700' : 'bg-stone-100 text-stone-500'} hover:opacity-80`}
                            >
                              <Star className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${c.title}"? This also removes its donations and updates.`)) {
                                  act(c.id, { action: 'delete_campaign', id: c.id });
                                }
                              }}
                              title="Delete"
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'withdrawals' && (
          <div className="mt-8 space-y-4">
            {withdrawals.length === 0 && (
              <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
                No withdrawal requests yet.
              </p>
            )}
            {withdrawals.map((w) => {
              const title = Array.isArray(w.campaigns) ? w.campaigns[0]?.title : w.campaigns?.title;
              return (
                <div key={w.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-stone-900">{title ?? 'Campaign'}</p>
                    <p className="text-sm text-stone-500">
                      {formatMoney(w.amount)} · requested {formatDate(w.requested_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        w.status === 'pending' ? 'bg-amber-100 text-amber-700' : w.status === 'approved' ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {w.status}
                    </span>
                    {w.status === 'pending' &&
                      (busyId === w.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                      ) : (
                        <>
                          <button
                            onClick={() => act(w.id, { action: 'process_withdrawal', id: w.id, status: 'approved' })}
                            className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700"
                          >
                            Approve payout
                          </button>
                          <button
                            onClick={() => act(w.id, { action: 'process_withdrawal', id: w.id, status: 'rejected' })}
                            className="rounded-lg border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:border-red-300 hover:text-red-600"
                          >
                            Reject
                          </button>
                        </>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'inquiries' && (
          <div className="mt-8 space-y-4">
            {inquiries.length === 0 && (
              <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
                No inquiries yet.
              </p>
            )}
            {inquiries.map((i) => (
              <div key={i.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${i.handled ? 'border-stone-100 opacity-70' : 'border-stone-200'}`}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {i.name} <span className="text-sm font-normal text-stone-500">· {i.email}</span>
                    </p>
                    <p className="text-xs text-stone-400">{formatDate(i.created_at)}</p>
                    <p className="mt-2 max-w-prose text-sm leading-6 text-stone-700">{i.message}</p>
                  </div>
                  {i.handled ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                      <Check className="h-3.5 w-3.5" />
                      Handled
                    </span>
                  ) : (
                    <button
                      onClick={() => act(i.id, { action: 'handle_inquiry', id: i.id })}
                      disabled={busyId === i.id}
                      className="shrink-0 self-start rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-70"
                    >
                      Mark handled
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'categories' && (
          <div className="mt-8 max-w-xl">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-stone-900">Add a category</h2>
              <div className="mt-4 flex gap-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Food Security"
                  className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
                <button
                  onClick={async () => {
                    if (!newCategory.trim()) return;
                    setBusyId('new-category');
                    try {
                      await adminFetch({ method: 'POST', body: JSON.stringify({ action: 'add_category', name: newCategory.trim() }) });
                      setNewCategory('');
                      await load();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Could not add category');
                    } finally {
                      setBusyId(null);
                    }
                  }}
                  disabled={busyId === 'new-category'}
                  className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-70"
                >
                  Add
                </button>
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.id} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 'faqs' && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {data.faqs.length === 0 && (
                <p className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
                  No FAQs yet — add your first one on the right.
                </p>
              )}
              {data.faqs.map((faq) =>
                editingFaq?.id === faq.id ? (
                  <div key={faq.id} className="rounded-2xl border border-primary-300 bg-white p-5 shadow-sm">
                    <input
                      value={editingFaq.question}
                      onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold focus:border-primary-500 focus:outline-none"
                    />
                    <textarea
                      rows={4}
                      value={editingFaq.answer}
                      onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                      className="mt-2 w-full resize-none rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={async () => {
                          setBusyId(faq.id);
                          try {
                            await adminFetch({
                              method: 'POST',
                              body: JSON.stringify({
                                action: 'update_faq',
                                id: faq.id,
                                question: editingFaq.question,
                                answer: editingFaq.answer,
                              }),
                            });
                            setEditingFaq(null);
                            await load();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Could not save FAQ');
                          } finally {
                            setBusyId(null);
                          }
                        }}
                        className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingFaq(null)}
                        className="rounded-lg border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:border-stone-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={faq.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-stone-900">{faq.question}</p>
                        <p className="mt-1 text-sm leading-6 text-stone-600">{faq.answer}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {busyId === faq.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingFaq(faq)}
                              className="rounded-lg bg-stone-100 p-2 text-stone-600 hover:bg-primary-50 hover:text-primary-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this FAQ?')) return;
                                setBusyId(faq.id);
                                try {
                                  await adminFetch({ method: 'POST', body: JSON.stringify({ action: 'delete_faq', id: faq.id }) });
                                  await load();
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : 'Could not delete FAQ');
                                } finally {
                                  setBusyId(null);
                                }
                              }}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
              <h2 className="font-display text-lg font-semibold text-stone-900">Add a FAQ</h2>
              <input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Question"
                className="mt-4 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <textarea
                rows={4}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Answer"
                className="mt-2 w-full resize-none rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <button
                onClick={async () => {
                  if (!newQuestion.trim() || !newAnswer.trim()) return;
                  setBusyId('new-faq');
                  try {
                    await adminFetch({
                      method: 'POST',
                      body: JSON.stringify({
                        action: 'add_faq',
                        question: newQuestion.trim(),
                        answer: newAnswer.trim(),
                        sort_order: data.faqs.length + 1,
                      }),
                    });
                    setNewQuestion('');
                    setNewAnswer('');
                    await load();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Could not add FAQ');
                  } finally {
                    setBusyId(null);
                  }
                }}
                disabled={busyId === 'new-faq' || !newQuestion.trim() || !newAnswer.trim()}
                className="mt-3 w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-70"
              >
                Add FAQ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
