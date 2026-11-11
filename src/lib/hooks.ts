import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Campaign, CampaignUpdate, Category, Donation } from './types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data, error: err }) => {
        if (err) setError('Could not load categories');
        else setCategories(data ?? []);
        setLoading(false);
      });
  }, []);

  return { categories, loading, error };
}

export function useCampaigns(options?: { featured?: boolean }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let query = supabase
      .from('campaigns')
      .select('*, categories(id, name, slug)')
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (options?.featured) query = query.eq('featured', true);
    query.then(({ data, error: err }) => {
      if (err) setError('Could not load campaigns');
      else setCampaigns((data as Campaign[]) ?? []);
      setLoading(false);
    });
  }, [options?.featured]);

  return { campaigns, loading, error };
}

export function useCampaign(id: string | undefined) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('campaigns')
      .select('*, categories(id, name, slug)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError('Could not load this campaign');
        else setCampaign((data as Campaign) ?? null);
        setLoading(false);
      });
  }, [id]);

  return { campaign, loading, error };
}

export function useDonations(campaignId: string | undefined) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!campaignId) return;
    supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDonations((data as Donation[]) ?? []);
        setLoading(false);
      });
  }, [campaignId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { donations, loading, refresh };
}

export function useCampaignUpdates(campaignId: string | undefined) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) return;
    supabase
      .from('updates')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUpdates(data ?? []);
        setLoading(false);
      });
  }, [campaignId]);

  return { updates, loading };
}
