import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/campaigns', label: 'Browse Campaigns' },
  { to: '/start', label: 'Start a Campaign' },
  { to: '/dashboard', label: 'My Dashboard' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/faq', label: 'FAQ' },
];

const causes = ['Education', 'Health', 'Water & Sanitation', 'Disaster Relief', 'Animals', 'Environment'];

export function Footer({ onNewsletterSubmit }: { onNewsletterSubmit: (email: string) => Promise<void> }) {
  return (
    <footer className="bg-primary-950 text-primary-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-1">
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm leading-6 text-primary-200">
              GiveRoot connects generous people with verified fundraisers around the world. Every gift, big or small, plants a seed of change.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Causes</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {causes.map((cause) => (
                <li key={cause}>
                  <Link to="/campaigns" className="transition-colors hover:text-white">
                    {cause}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Stay in the loop</h3>
            <p className="mt-4 text-sm text-primary-200">Get monthly impact stories in your inbox.</p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
                onNewsletterSubmit(input.value).then(() => {
                  input.value = '';
                });
              }}
            >
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full min-w-0 flex-1 rounded-lg border border-primary-700 bg-primary-900 px-3 py-2 text-sm text-white placeholder:text-primary-300 focus:border-primary-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent-400 px-4 py-2 text-sm font-semibold text-primary-950 transition-colors hover:bg-accent-300"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-800 pt-8 text-sm text-primary-300 sm:flex-row">
          <p>© {new Date().getFullYear()} GiveRoot. All rights reserved.</p>
          <p>Payments are simulated for demonstration purposes.</p>
        </div>
      </div>
    </footer>
  );
}
