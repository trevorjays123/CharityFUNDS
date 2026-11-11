import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HandHeart, Sparkles, ShieldCheck, Quote, MailCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCampaigns } from '../lib/hooks';
import { CampaignCard } from '../components/CampaignCard';
import { DonateModal } from '../components/DonateModal';
import { StatCounter } from '../components/StatCounter';
import { formatCompact, timeAgo } from '../lib/format';
import type { Campaign, Donation } from '../lib/types';

const HERO_IMAGE =
  'https://images.pexels.com/photos/6646926/pexels-photo-6646926.jpeg?auto=compress&cs=tinysrgb&w=1600';

const SUCCESS_STORIES = [
  {
    title: 'A well that changed everything',
    body: 'Two years ago the Mwansa family walked six hours a day for water. Today their village borehole serves 2,400 people — and Sarah, 12, is back in school.',
    name: 'Kasese Village, Uganda',
    image:
      'https://images.pexels.com/photos/28101466/pexels-photo-28101466.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    title: 'From hospital bed to honor roll',
    body: 'Amara received life-saving heart surgery funded by 214 donors in 19 days. Last term, she finished top of her class.',
    name: 'Addis Ababa, Ethiopia',
    image:
      'https://images.pexels.com/photos/6129435/pexels-photo-6129435.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    title: 'The classroom that grew',
    body: 'What began as 20 children under a mango tree is now a two-room school with 180 students — built entirely by parents and 900 small gifts.',
    name: 'Lilongwe, Malawi',
    image:
      'https://images.pexels.com/photos/8141591/pexels-photo-8141591.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

export function LandingPage() {
  const { campaigns, loading } = useCampaigns();
  const [donateCampaign, setDonateCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState({ totalRaised: 0, donorCount: 0 });
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [updates, setUpdates] = useState<{ id: string; title: string; body: string; created_at: string; campaign_title: string | undefined }[]>([]);
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    supabase
      .from('donations')
      .select('id, amount, donor_name, donor_email, message, payment_method, payment_status, created_at, campaign_id, campaigns(id, title, image_url)')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setRecentDonations(data as unknown as Donation[]);
      });
    supabase
      .from('updates')
      .select('id, title, body, created_at, campaigns(title)')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data)
          setUpdates(
            data.map((u: { id: string; title: string; body: string; created_at: string; campaigns: { title: string } | { title: string }[] | null }) => ({
              id: u.id,
              title: u.title,
              body: u.body,
              created_at: u.created_at,
              campaign_title: Array.isArray(u.campaigns) ? u.campaigns[0]?.title : u.campaigns?.title,
            }))
          );
      });
  }, []);

  useEffect(() => {
    if (campaigns.length === 0) return;
    const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.raised_amount), 0);
    supabase
      .from('donations')
      .select('donor_email, amount', { count: 'exact' })
      .then(({ data, count }) => {
        const uniqueDonors = new Set<string>();
        let sum = 0;
        (data ?? []).forEach((d) => {
          sum += Number(d.amount);
          if (d.donor_email) uniqueDonors.add(d.donor_email);
          else uniqueDonors.add(`anon-${Math.floor(Number(d.amount))}`);
        });
        setStats({ totalRaised: sum || totalRaised, donorCount: count ?? uniqueDonors.size });
      });
  }, [campaigns]);

  const featured = useMemo(() => campaigns.filter((c) => c.featured).slice(0, 3), [campaigns]);
  const grid = useMemo(() => (featured.length ? featured : campaigns).slice(0, 6), [featured, campaigns]);

  const handleNewsletter = async (email: string) => {
    setNewsletterState('loading');
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim() });
    setNewsletterState(error ? 'error' : 'done');
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-950">
        <img
          src={HERO_IMAGE}
          alt="Volunteers distributing aid"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/80 via-primary-950/60 to-primary-950" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-100 ring-1 ring-white/20">
              <Sparkles className="h-4 w-4" />
              100% of every donation reaches the cause
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Generosity, <span className="text-accent-300">rooted</span> in real change.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-primary-100">
              Start a fundraiser in minutes or support verified causes around the world. Together, our community has turned small gifts into life-changing outcomes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/start"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-400 px-7 py-3.5 text-base font-semibold text-primary-950 shadow-lg transition-all hover:bg-accent-300 hover:shadow-xl"
              >
                Start a Campaign
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/campaigns"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-primary-800 shadow-lg transition-all hover:bg-primary-50"
              >
                Donate Now
              </Link>
            </div>
          </div>
          <div className="relative mt-16 grid grid-cols-3 gap-4 rounded-2xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-md sm:gap-8 sm:p-8">
            <StatCounter label="Total Raised" target={stats.totalRaised} />
            <StatCounter label="Active Campaigns" target={campaigns.length} />
            <StatCounter label="Total Donors" target={stats.donorCount} />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-stone-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: ShieldCheck, text: 'Every campaign reviewed by our team' },
            { icon: HandHeart, text: 'Donations go directly to organizers' },
            { icon: Sparkles, text: 'Progress updates from the field' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-3 text-sm font-medium text-stone-600">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Icon className="h-4.5 w-4.5" />
              </span>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Featured campaigns */}
      <section className="bg-stone-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">Featured campaigns</h2>
              <p className="mt-2 max-w-xl text-stone-600">
                Hand-picked fundraisers where your gift makes an immediate, measurable difference.
              </p>
            </div>
            <Link to="/campaigns" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800">
              View all campaigns
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="mt-10 flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((c) => (
                <CampaignCard key={c.id} campaign={c} onQuickDonate={setDonateCampaign} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent news + live activity */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <h2 className="font-display text-3xl font-bold text-stone-900">Recent updates from the field</h2>
            <div className="mt-8 space-y-6">
              {updates.map((u) => (
                <article key={u.id} className="rounded-2xl border border-stone-200 p-6 transition-shadow hover:shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">{u.campaign_title}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-stone-900">{u.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{u.body}</p>
                  <p className="mt-3 text-xs text-stone-400">{timeAgo(u.created_at)}</p>
                </article>
              ))}
              {updates.length === 0 && <p className="text-sm text-stone-500">No updates yet.</p>}
            </div>
          </div>
          <div>
            <div className="rounded-2xl bg-primary-950 p-6 text-white">
              <h3 className="font-display text-xl font-semibold">Live giving</h3>
              <p className="mt-1 text-sm text-primary-200">The latest gifts from our community.</p>
              <ul className="mt-5 space-y-3">
                {recentDonations.map((d) => {
                  const campaignTitle = Array.isArray(d.campaigns) ? d.campaigns[0]?.title : d.campaigns?.title;
                  return (
                    <li key={d.id} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-400 text-xs font-bold text-primary-950">
                        {d.donor_name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {d.donor_name} gave {formatCompact(d.amount)}
                        </p>
                        <p className="truncate text-xs text-primary-200">{campaignTitle}</p>
                      </div>
                    </li>
                  );
                })}
                {recentDonations.length === 0 && <li className="text-sm text-primary-200">No donations yet.</li>}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success stories */}
      <section className="bg-primary-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-bold text-white sm:text-4xl">Success stories</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-primary-200">
            Real people, real outcomes — proof that ordinary generosity becomes extraordinary change.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SUCCESS_STORIES.map((s) => (
              <figure key={s.title} className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                <img src={s.image} alt={s.title} className="h-44 w-full object-cover" loading="lazy" />
                <div className="p-6">
                  <Quote className="h-5 w-5 text-accent-300" />
                  <blockquote className="mt-3 text-sm leading-6 text-primary-100">{s.body}</blockquote>
                  <figcaption className="mt-4">
                    <p className="font-display font-semibold text-white">{s.title}</p>
                    <p className="text-xs text-primary-300">{s.name}</p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-accent-50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-400/20 text-accent-600">
            <MailCheck className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            Get good news in your inbox
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            One email a month. Impact stories, new campaigns, zero spam.
          </p>
          {newsletterState === 'done' ? (
            <p className="mx-auto mt-6 max-w-md rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
              You are on the list! Watch your inbox for our next impact story.
            </p>
          ) : (
            <form
              className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
                handleNewsletter(input.value).then(() => {
                  input.value = '';
                });
              }}
            >
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full flex-1 rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="submit"
                disabled={newsletterState === 'loading'}
                className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-70"
              >
                Subscribe
              </button>
            </form>
          )}
          {newsletterState === 'error' && (
            <p className="mt-3 text-sm text-red-600">Something went wrong — please try again.</p>
          )}
        </div>
      </section>

      {donateCampaign && (
        <DonateModal
          campaign={donateCampaign}
          onClose={() => setDonateCampaign(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
