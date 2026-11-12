import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Megaphone, MessageCircle, Trophy, Users } from 'lucide-react';
import { useCampaign, useCampaignUpdates, useDonations } from '../lib/hooks';
import { CampaignHeader, DonorLeaderboard } from '../components/campaignDetail';
import { CommentSection } from '../components/CommentSection';
import { DonateModal } from '../components/DonateModal';
import { formatDate, formatMoney } from '../lib/format';
import { supabase } from '../lib/supabase';
import { setPageMeta, resetPageMeta } from '../lib/meta';
import { campaignShareUrl } from '../lib/shareUrl';

type Tab = 'story' | 'updates' | 'donors';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { campaign, loading, error } = useCampaign(id);
  const { donations, refresh } = useDonations(id);
  const { updates } = useCampaignUpdates(id);
  const [tab, setTab] = useState<Tab>('story');
  const [donating, setDonating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [withdrawState, setWithdrawState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const requestWithdrawal = async () => {
    if (!campaign) return;
    setWithdrawState('sending');
    const { error: err } = await supabase
      .from('withdrawals')
      .insert({ campaign_id: campaign.id, amount: Number(campaign.raised_amount) });
    setWithdrawState(err ? 'idle' : 'sent');
  };
  useEffect(() => {
    if (id) setIsSaved(localStorage.getItem(`saveroot-${id}`) === '1');
  }, [id]);

  const toggleSave = useCallback(() => {
    if (!id) return;
    const next = !isSaved;
    setIsSaved(next);
    if (next) localStorage.setItem(`saveroot-${id}`, '1');
    else localStorage.removeItem(`saveroot-${id}`);
  }, [id, isSaved]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-stone-900">Campaign not found</h1>
        <p className="mt-2 text-stone-600">This campaign may have been removed or is awaiting approval.</p>
        <Link to="/campaigns" className="mt-6 inline-block rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700">
          Browse campaigns
        </Link>
      </div>
    );
  }

  const donorCount = new Set(donations.map((d) => d.donor_email || d.donor_name)).size;

  const canonicalUrl = `${window.location.origin}/campaigns/${campaign.id}`;
  const shareUrl = campaignShareUrl(campaign.id);
  const shareText = `${campaign.title}${campaign.location ? ` in ${campaign.location}` : ''}`;
  const shareDescription =
    campaign.raised_amount > 0
      ? `${Math.round((Number(campaign.raised_amount) / Number(campaign.goal_amount)) * 100)}% funded — add your gift today`
      : campaign.description;

  useEffect(() => {
    setPageMeta({
      title: `${campaign.title} | Future Stars Foundation`,
      description: shareDescription,
      image: campaign.image_url,
    });
    return () => resetPageMeta();
  }, [campaign.title, campaign.image_url, shareDescription]);

  return (
    <div className="bg-stone-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link to="/campaigns" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4" />
          All campaigns
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="overflow-hidden rounded-2xl shadow-sm">
              {campaign.image_url && (
                <img src={campaign.image_url} alt={campaign.title} className="aspect-[16/8] w-full object-cover" />
              )}
            </div>
            <div className="mt-6">
              {campaign.categories && (
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  {campaign.categories.name}
                </span>
              )}
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
                {campaign.title}
              </h1>
              <p className="mt-3 text-lg leading-8 text-stone-600">{campaign.description}</p>
            </div>

            <div className="mt-8 border-b border-stone-200">
              <div className="flex gap-1">
                {(
                  [
                    { key: 'story', label: 'Story', icon: Megaphone, count: undefined },
                    { key: 'updates', label: 'Updates', icon: MessageCircle, count: updates.length },
                    { key: 'donors', label: 'Top donors', icon: Trophy, count: undefined },
                  ] as { key: Tab; label: string; icon: typeof Megaphone; count?: number }[]
                ).map(({ key, label, icon: Icon, count }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                      tab === key
                        ? 'border-primary-600 text-primary-700'
                        : 'border-transparent text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {typeof count === 'number' && count > 0 && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">{count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-8">
              {tab === 'story' && (
                <div className="max-w-prose space-y-4 text-[15px] leading-7 text-stone-700">
                  {(campaign.story ?? campaign.description).split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  <div className="rounded-2xl bg-primary-50 p-5">
                    <p className="flex items-center gap-2 font-semibold text-primary-800">
                      <Users className="h-4 w-4" />
                      Organized by {campaign.creator_name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-primary-900/80">
                      This organizer's identity and campaign details were verified by the Future Stars Foundation review team before
                      this fundraiser was approved.
                    </p>
                  </div>
                </div>
              )}
              {tab === 'updates' && (
                <div className="max-w-prose space-y-6">
                  {updates.length === 0 && <p className="text-sm text-stone-500">No updates posted yet.</p>}
                  {updates.map((u) => (
                    <article key={u.id} className="rounded-2xl border border-stone-200 p-5">
                      <p className="text-xs font-medium text-stone-400">{formatDate(u.created_at)}</p>
                      <h3 className="mt-1 font-display text-lg font-semibold text-stone-900">{u.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{u.body}</p>
                    </article>
                  ))}
                </div>
              )}
              {tab === 'donors' && <DonorLeaderboard donations={donations} />}
            </div>

            <div className="border-t border-stone-100 pb-12">
              <CommentSection campaignId={campaign.id} />
            </div>
          </div>

          <div>
            <CampaignHeader
              campaign={campaign}
              donorCount={donorCount}
              onDonate={() => setDonating(true)}
              isSaved={isSaved}
              onSaveToggle={toggleSave}
              withdrawState={withdrawState}
              onRequestWithdrawal={requestWithdrawal}
              shareUrl={shareUrl}
              shareTitle={shareText}
              shareDescription={shareDescription}
            />
          </div>
        </div>
      </div>

      {donating && (
        <DonateModal
          campaign={campaign}
          onClose={() => setDonating(false)}
          onSuccess={() => refresh()}
        />
      )}
    </div>
  );
}
