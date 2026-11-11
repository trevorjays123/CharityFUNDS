import { useMemo, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useCampaigns, useCategories } from '../lib/hooks';
import { CampaignCard } from '../components/CampaignCard';
import { DonateModal } from '../components/DonateModal';
import type { Campaign } from '../lib/types';

export function CampaignsPage() {
  const { campaigns, loading } = useCampaigns();
  const { categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'recent' | 'goal'>('progress');
  const [donateCampaign, setDonateCampaign] = useState<Campaign | null>(null);

  const filtered = useMemo(() => {
    let list = campaigns.filter((c) => {
      const matchesCategory = activeCategory === 'all' || c.categories?.slug === activeCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || (c.location ?? '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'recent') return +new Date(b.created_at) - +new Date(a.created_at);
      if (sortBy === 'goal') return Number(b.goal_amount) - Number(a.goal_amount);
      return Number(b.raised_amount) / Number(b.goal_amount) - Number(a.raised_amount) / Number(a.goal_amount);
    });
    return list;
  }, [campaigns, activeCategory, search, sortBy]);

  return (
    <div className="bg-stone-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-stone-900">Browse campaigns</h1>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">
            Every campaign is reviewed by our team before it goes live. Find a cause that speaks to you.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, cause, or location…"
                className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'progress' | 'recent' | 'goal')}
              className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 focus:border-primary-500 focus:outline-none"
            >
              <option value="progress">Most funded</option>
              <option value="recent">Newest</option>
              <option value="goal">Largest goal</option>
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === 'all' ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              All causes
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeCategory === cat.slug ? 'bg-primary-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-xl text-stone-700">No campaigns match your search</p>
            <p className="mt-2 text-sm text-stone-500">Try a different keyword or cause category.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CampaignCard key={c.id} campaign={c} onQuickDonate={setDonateCampaign} />
            ))}
          </div>
        )}
      </div>

      {donateCampaign && (
        <DonateModal campaign={donateCampaign} onClose={() => setDonateCampaign(null)} onSuccess={() => {}} />
      )}
    </div>
  );
}
