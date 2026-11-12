const SITE_NAME = 'Future Stars Foundation';

export const DEFAULT_TITLE = `${SITE_NAME} — Fundraise, Donate, Change Lives`;
export const DEFAULT_DESCRIPTION =
  `${SITE_NAME} is a charity and crowdfunding platform where anyone can start a fundraiser or support causes they believe in.`;

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

interface PageMeta {
  title: string;
  description: string;
  image?: string | null;
}

export function setPageMeta({ title, description, image }: PageMeta) {
  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', window.location.href);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  if (image) {
    upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:image', image);
  }
}

export function resetPageMeta() {
  setPageMeta({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION });
}
