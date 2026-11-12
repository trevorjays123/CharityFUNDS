import { useEffect, useRef, useState } from 'react';
import { Check, Facebook, Link2, Linkedin, Mail, Share2, Twitter } from 'lucide-react';

interface ShareMenuProps {
  title: string;
  url: string;
  description: string;
}

export function ShareMenu({ title, url, description }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const shareText = `${title} — ${description}`.slice(0, 200);
  const encodedUrl = encodeURIComponent(url);
  const encodedShareText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: 'Share on X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedUrl}`,
    },
    {
      label: 'Share on Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedShareText}`,
    },
    {
      label: 'Share on LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'Share via email',
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard unavailable (e.g. insecure context) — still show feedback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-primary-300 hover:text-primary-700"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-20 mb-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg"
        >
          {links.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          ))}
          <button
            onClick={() => {
              copyLink();
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            {copied ? <Check className="h-4 w-4 text-primary-600" /> : <Link2 className="h-4 w-4" />}
            {copied ? 'Link copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}
