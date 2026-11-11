import { useEffect, useState } from 'react';
import { X, CreditCard, ShieldCheck, Lock, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatMoney } from '../lib/format';
import type { Campaign } from '../lib/types';

interface DonateModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESETS = [25, 50, 100, 250];

export function DonateModal({ campaign, onClose, onSuccess }: DonateModalProps) {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [frequency, setFrequency] = useState<'one_time' | 'monthly'>('one_time');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const effectiveAmount = customAmount !== '' ? Number(customAmount) : amount;

  const submit = async () => {
    if (!donorName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!Number.isFinite(effectiveAmount) || effectiveAmount < 1) {
      setError('Please enter a donation amount of at least $1.');
      return;
    }
    setError(null);
    setSubmitting(true);
    // Simulated payment processing (Stripe/PayPal) — replace with a real
    // checkout session via a Supabase Edge Function when going live.
    await new Promise((r) => setTimeout(r, 1400));
    const { error: rpcError } = await supabase.rpc('make_donation', {
      p_campaign_id: campaign.id,
      p_donor_name: donorName.trim(),
      p_amount: effectiveAmount,
      p_donor_email: donorEmail.trim() || null,
      p_message: message.trim() || null,
      p_payment_method: method,
      p_frequency: frequency,
    });
    setSubmitting(false);
    if (rpcError) {
      setError('Your donation could not be processed. Please try again.');
      return;
    }
    setDone(true);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-stone-100 bg-white px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-stone-900">
              {done ? 'Thank you!' : 'Donate to'}
            </h2>
            {!done && <p className="text-sm text-stone-500">{campaign.title}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="count-pop flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <CheckCircle2 className="h-9 w-9 text-primary-600" />
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold text-stone-900">
              {formatMoney(effectiveAmount)} on its way
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-stone-600">
              Your {frequency === 'monthly' ? 'monthly gift' : 'gift'} to “{campaign.title}” was processed successfully via {method === 'stripe' ? 'Stripe' : 'PayPal'}.
              A receipt is on its way{donorEmail ? ` to ${donorEmail}` : ''}.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 sm:w-auto sm:px-8"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${
                    customAmount === '' && amount === preset
                      ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                      : 'border-stone-200 text-stone-700 hover:border-primary-300 hover:text-primary-700'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            <div className="relative mt-3">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-stone-400">$</span>
              <input
                type="number"
                min={1}
                inputMode="decimal"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full rounded-xl border border-stone-200 py-3 pl-8 pr-4 text-sm font-medium text-stone-900 placeholder:font-normal placeholder:text-stone-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Your name *"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <textarea
              placeholder="Leave an encouraging message (optional)"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-3 w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Payment method</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethod('stripe')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                    method === 'stripe'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-stone-200 text-stone-600 hover:border-primary-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Card via Stripe
                </button>
                <button
                  onClick={() => setMethod('paypal')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                    method === 'paypal'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-stone-200 text-stone-600 hover:border-primary-300'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  PayPal
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setFrequency('one_time')}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                  frequency === 'one_time'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-stone-200 text-stone-600 hover:border-primary-300'
                }`}
              >
                One-time
              </button>
              <button
                onClick={() => setFrequency('monthly')}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                  frequency === 'monthly'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-stone-200 text-stone-600 hover:border-primary-300'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Monthly
              </button>
            </div>
            {frequency === 'monthly' && (
              <p className="mt-2 rounded-lg bg-primary-50 px-3 py-2 text-xs leading-5 text-primary-700">
                Your gift of {formatMoney(effectiveAmount || 0)} will repeat automatically every month. Cancel anytime.
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={submitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing securely…
                </>
              ) : (
                <>
                  Donate {Number.isFinite(effectiveAmount) && effectiveAmount >= 1 ? formatMoney(effectiveAmount) : ''}
                  {frequency === 'monthly' ? ' / month' : ''}
                </>
              )}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-stone-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Simulated checkout — no real payment is made
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
