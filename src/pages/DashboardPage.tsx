import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, Search, Trash2, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Campaign, Donation } from '../lib/types';
import { formatDate, formatMoney } from '../lib/format';

export function DashboardPage() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(localStorage.getItem('giveroot-email'));
  const [donations, setDonations] = useState<Donation[]>([]);
  const [saved, setSaved] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async (lookupEmail: string) => {
    setLoading(true);
    const [donationsRes, savedRes] = await Promise.all([
      supabase
        .from('donations')
        .select('*, campaigns(id, title, image_url)')
        .eq('donor_email', lookupEmail)
        .order('created_at', { ascending: false }),
      supabase.from('saved_campaigns').select('campaigns(*)').eq('donor_email', lookupEmail),
    ]);
    setDonations((donationsRes.data as Donation[]) ?? []);
    setSaved(
      ((savedRes.data as { campaigns: Campaign | Campaign[] | null }[]) ?? [])
        .map((row) => (Array.isArray(row.campaigns) ? row.campaigns[0] : row.campaigns))
        .filter((c): c is Campaign => Boolean(c && c.status === 'approved'))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (submittedEmail) load(submittedEmail);
  }, [submittedEmail, load]);

  const lookup = async () => {
    if (!email.includes('@')) return;
    setSearching(true);
    localStorage.setItem('giveroot-email', email.trim().toLowerCase());
    setSubmittedEmail(email.trim().toLowerCase());
    await load(email.trim().toLowerCase());
    setSearching(false);
  };

  const removeSaved = async (campaignId: string) => {
    if (!submittedEmail) return;
    setSaved((prev) => prev.filter((c) => c.id !== campaignId));
    await supabase
      .from('saved_campaigns')
      .delete()
      .eq('donor_email', submittedEmail)
      .eq('campaign_id', campaignId);
  };

  const totalGiven = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  if (!submittedEmail) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Search className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-stone-900">Find your giving history</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Enter the email address you used when donating to see your donation history and saved campaigns.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            <button
              onClick={lookup}
              disabled={searching}
              className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-70"
            >
              {searching ? 'Looking…' : 'Look up'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900">My giving dashboard</h1>
            <p className="mt-1 text-sm text-stone-600">Signed in as {submittedEmail}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('giveroot-email');
              setSubmittedEmail(null);
              setEmail('');
              setDonations([]);
              setSaved([]);
            }}
            className="self-start rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:border-primary-300 hover:text-primary-700"
          >
            Change email
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-stone-900">Donation history</h2>
                  <div className="flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-bold text-primary-700">
                    <Wallet className="h-4 w-4" />
                    {formatMoney(totalGiven)} total
                  </div>
                </div>
                {donations.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-stone-500">No donations found for this email yet.</p>
                    <Link to="/campaigns" className="mt-3 inline-block text-sm font-semibold text-primary-700 hover:text-primary-800">
                      Find a cause to support →
                    </Link>
                  </div>
                ) : (
                  <ul className="mt-5 divide-y divide-stone-100">
                    {donations.map((d) => {
                      const campaign = Array.isArray(d.campaigns) ? d.campaigns[0] : d.campaigns;
                      return (
                        <li key={d.id} className="flex items-center gap-4 py-4">
                          {campaign?.image_url && (
                            <img src={campaign.image_url} alt="" className="h-12 w-16 rounded-lg object-cover" />
                          )}
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/campaigns/${d.campaign_id}`}
                              className="truncate text-sm font-semibold text-stone-900 hover:text-primary-700"
                            >
                              {campaign?.title ?? 'Campaign'}
                            </Link>
                            <p className="text-xs text-stone-500">
                              {formatDate(d.created_at)} · paid via {d.payment_method === 'stripe' ? 'card' : 'PayPal'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary-700">{formatMoney(d.amount)}</p>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                d.payment_status === 'succeeded' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {d.payment_status}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-stone-900">
                  <Heart className="h-5 w-5 text-primary-600" />
                  Saved campaigns
                </h2>
                {saved.length === 0 ? (
                  <p className="py-8 text-center text-sm text-stone-500">
                    Nothing saved yet — tap the heart on any campaign to follow its progress.
                  </p>
                ) : (
                  <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                    {saved.map((c) => (
                      <li key={c.id} className="flex items-center gap-3 rounded-xl border border-stone-100 p-3">
                        {c.image_url && <img src={c.image_url} alt="" className="h-12 w-16 rounded-lg object-cover" />}
                        <div className="min-w-0 flex-1">
                          <Link to={`/campaigns/${c.id}`} className="line-clamp-2 text-sm font-semibold text-stone-900 hover:text-primary-700">
                            {c.title}
                          </Link>
                          <p className="text-xs text-stone-500">
                            {formatMoney(c.raised_amount)} raised
                          </p>
                        </div>
                        <button
                          onClick={() => removeSaved(c.id)}
                          className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove from saved"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl bg-primary-950 p-6 text-white">
                <h3 className="font-display text-lg font-semibold">Your impact this year</h3>
                <p className="mt-3 font-display text-4xl font-bold text-accent-300">{donations.length}</p>
                <p className="text-sm text-primary-200">gifts given to verified causes</p>
                <div className="mt-5 border-t border-white/10 pt-4 text-sm text-primary-100">
                  Thank you for being part of the {formatMoney(totalGiven)} story. Every dollar goes straight to the organizer.
                </div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-stone-900">Start your own fundraiser</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Have a cause close to your heart? Launch a campaign and reach thousands of donors.
                </p>
                <Link
                  to="/start"
                  className="mt-4 block rounded-xl bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Start a campaign
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
