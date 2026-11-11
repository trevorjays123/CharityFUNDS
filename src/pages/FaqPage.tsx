import { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Faq } from '../lib/types';

export function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase
      .from('faqs')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (!data) setError(true);
        setFaqs((data as Faq[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-stone-50 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <HelpCircle className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-stone-600">
            Everything you need to know about donating and fundraising on GiveRoot.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : error ? (
          <p className="py-16 text-center text-sm text-red-600">
            Could not load the FAQ right now — please refresh the page.
          </p>
        ) : (
          <div className="mt-10 space-y-3">
            {faqs.map((faq) => {
              const open = openId === faq.id;
              return (
                <div key={faq.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                  <button
                    onClick={() => setOpenId(open ? null : faq.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-stone-900">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-stone-400 transition-transform duration-300 ${open ? 'rotate-180 text-primary-600' : ''}`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-7 text-stone-600">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {faqs.length === 0 && <p className="py-12 text-center text-sm text-stone-500">No FAQs yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
