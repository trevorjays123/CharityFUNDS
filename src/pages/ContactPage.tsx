import { useState } from 'react';
import { CheckCircle2, Loader2, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !email.includes('@') || !message.trim()) {
      setError('Please fill in your name, a valid email, and a message.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: insertError } = await supabase
      .from('inquiries')
      .insert({ name: name.trim(), email: email.trim(), message: message.trim() });
    setSubmitting(false);
    if (insertError) {
      setError('Your message could not be sent. Please try again.');
      return;
    }
    setDone(true);
  };

  return (
    <div className="bg-stone-50 py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Mail className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-stone-900 sm:text-4xl">Get in touch</h1>
          <p className="mt-3 text-stone-600">
            Questions about a campaign, a donation, or starting your own fundraiser? Our team replies within one business day.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          {done ? (
            <div className="py-8 text-center">
              <span className="count-pop mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                <CheckCircle2 className="h-7 w-7 text-primary-600" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-stone-900">Message sent</h2>
              <p className="mt-2 text-sm text-stone-600">Thanks for reaching out — we will get back to you shortly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-stone-700">Name *</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </label>
                <label>
                  <span className="text-sm font-semibold text-stone-700">Email *</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </label>
              </div>
              <label>
                <span className="text-sm font-semibold text-stone-700">Message *</span>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </label>
              {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <button
                onClick={submit}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Send message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
