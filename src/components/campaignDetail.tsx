import { Link } from 'react-router-dom';
import { Calendar, MapPin, Target, TrendingUp, Users, Heart, Wallet } from 'lucide-react';
import { ShareMenu } from './ShareMenu';
import type { Campaign, Donation } from '../lib/types';
import { formatDate, formatMoney, timeAgo } from '../lib/format';

interface CampaignHeaderProps {
  campaign: Campaign;
  donorCount: number;
  onDonate: () => void;
  isSaved: boolean;
  onSaveToggle: () => void;
  withdrawState: 'idle' | 'sending' | 'sent';
  onRequestWithdrawal: () => void;
}
export function CampaignHeader({ campaign, donorCount, onDonate, isSaved, onSaveToggle, withdrawState, onRequestWithdrawal }: CampaignHeaderProps) {
  const pct = Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-3xl font-bold text-primary-700">{formatMoney(campaign.raised_amount)}</span>
        <span className="text-sm font-medium text-stone-500">of {formatMoney(campaign.goal_amount)}</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-sm font-medium text-primary-700">{pct}% funded</p>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-primary-50 p-4 text-center">
        <div>
          <TrendingUp className="mx-auto h-4 w-4 text-primary-600" />
          <p className="mt-1 text-sm font-bold text-stone-900">{pct}%</p>
          <p className="text-xs text-stone-500">Funded</p>
        </div>
        <div>
          <Users className="mx-auto h-4 w-4 text-primary-600" />
          <p className="mt-1 text-sm font-bold text-stone-900">{donorCount}</p>
          <p className="text-xs text-stone-500">Donors</p>
        </div>
        <div>
          <Calendar className="mx-auto h-4 w-4 text-primary-600" />
          <p className="mt-1 text-sm font-bold text-stone-900">{timeAgo(campaign.created_at)}</p>
          <p className="text-xs text-stone-500">Launched</p>
        </div>
      </div>

      <button
        onClick={onDonate}
        className="mt-5 w-full rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md"
      >
        Donate now
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={onSaveToggle}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            isSaved
              ? 'border-primary-600 bg-primary-50 text-primary-700'
              : 'border-stone-200 text-stone-700 hover:border-primary-300 hover:text-primary-700'
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <ShareMenu title={campaign.title} />
      </div>

      <div className="mt-6 space-y-3 border-t border-stone-100 pt-5 text-sm">
        <div className="flex items-start gap-3">
          <Users className="mt-0.5 h-4 w-4 text-stone-400" />
          <div>
            <p className="font-medium text-stone-900">{campaign.creator_name}</p>
            <p className="text-xs text-stone-500">Organizer · Verified</p>
          </div>
        </div>
        {campaign.location && (
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-stone-400" />
            <span className="text-stone-600">{campaign.location}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Target className="h-4 w-4 text-stone-400" />
          <span className="text-stone-600">Launched {formatDate(campaign.created_at)}</span>
        </div>
      </div>

      <Link
        to="/campaigns"
        className="mt-5 block text-center text-sm font-medium text-primary-700 hover:text-primary-800"
      >
        Browse more campaigns
      </Link>

      {campaign.raised_amount > 0 && (
        <div className="mt-5 rounded-xl bg-stone-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-stone-800">
            <Wallet className="h-4 w-4 text-primary-600" />
            Organizer payouts
          </p>
          {withdrawState === 'sent' ? (
            <p className="mt-2 text-xs leading-5 text-primary-700">
              Withdrawal request for {formatMoney(campaign.raised_amount)} submitted. Our team will process it shortly.
            </p>
          ) : (
            <button
              onClick={onRequestWithdrawal}
              disabled={withdrawState === 'sending'}
              className="mt-2 w-full rounded-lg border border-primary-300 px-4 py-2 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50 disabled:opacity-70"
            >
              {withdrawState === 'sending' ? 'Submitting…' : `Request withdrawal of ${formatMoney(campaign.raised_amount)}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function DonorLeaderboard({ donations }: { donations: Donation[] }) {
  const top = [...donations].sort((a, b) => b.amount - a.amount).slice(0, 8);
  if (top.length === 0) return <p className="text-sm text-stone-500">No donations yet — be the first!</p>;
  return (
    <ol className="space-y-3">
      {top.map((d, i) => (
        <li key={d.id} className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              i === 0 ? 'bg-accent-400 text-white' : i < 3 ? 'bg-primary-600 text-white' : 'bg-stone-200 text-stone-600'
            }`}
          >
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-900">{d.donor_name}</p>
            {d.message && <p className="truncate text-xs text-stone-500">“{d.message}”</p>}
          </div>
          <span className="text-sm font-bold text-primary-700">{formatMoney(d.amount)}</span>
        </li>
      ))}
    </ol>
  );
}
