const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const APP_URL = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.replace(/\/+$/, '') ?? '';

/**
 * Shareable link for a campaign. Points at the campaign-link edge function, which serves
 * per-campaign preview tags to social crawlers and redirects real visitors to the app.
 * Without a configured public app URL it falls back to the in-app canonical path.
 */
export function campaignShareUrl(campaignId: string): string {
  if (APP_URL) {
    return `${SUPABASE_URL}/functions/v1/campaign-link?campaign=${campaignId}`;
  }
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/campaigns/${campaignId}`;
}

export function publicAppUrl(): string {
  return APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
}
