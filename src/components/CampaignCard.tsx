import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import type { Campaign } from '../lib/types';
import { formatMoney } from '../lib/format';

interface CampaignCardProps {
  campaign: Campaign;
  onQuickDonate?: (campaign: Campaign) => void;
  onSaveToggle?: (campaign: Campaign) => void;
  isSaved?: boolean;
}

export function CampaignCard({ campaign, onQuickDonate, onSaveToggle, isSaved }: CampaignCardProps) {
  const pct = Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/campaigns/${campaign.id}`} className="relative block aspect-[16/10] overflow-hidden">
        {campaign.image_url ? (
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-primary-100" />
        )}
        {campaign.categories && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm">
            {campaign.categories.name}
          </span>
        )}
        {onSaveToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onSaveToggle(campaign);
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save campaign'}
            className={`absolute right-3 top-3 rounded-full p-2 shadow-sm transition-colors ${
              isSaved ? 'bg-primary-600 text-white' : 'bg-white/95 text-stone-500 hover:text-primary-600'
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/campaigns/${campaign.id}`}>
          <h3 className="font-display text-lg font-semibold leading-snug text-stone-900 transition-colors group-hover:text-primary-700">
            {campaign.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-stone-600">{campaign.description}</p>
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-primary-700">{formatMoney(campaign.raised_amount)}</span>
            <span className="text-stone-500">of {formatMoney(campaign.goal_amount)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span>{pct}% funded</span>
            {campaign.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {campaign.location}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {onQuickDonate && (
            <button
              onClick={() => onQuickDonate(campaign)}
              className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Donate
            </button>
          )}
          <Link
            to={`/campaigns/${campaign.id}`}
            className="flex-1 rounded-lg border border-stone-200 px-4 py-2.5 text-center text-sm font-semibold text-stone-700 transition-colors hover:border-primary-300 hover:text-primary-700"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
