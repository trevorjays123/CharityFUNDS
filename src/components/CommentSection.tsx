import { useEffect, useState } from 'react';
import { Loader2, MessageCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Comment } from '../lib/types';
import { timeAgo } from '../lib/format';

export function CommentSection({ campaignId }: { campaignId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('comments')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setComments((data as Comment[]) ?? []);
        setLoading(false);
      });
  }, [campaignId]);

  const submit = async () => {
    if (!name.trim() || !body.trim()) {
      setError('Please add your name and a comment.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { data, error: err } = await supabase
      .from('comments')
      .insert({ campaign_id: campaignId, author_name: name.trim(), body: body.trim() })
      .select()
      .maybeSingle();
    setSubmitting(false);
    if (err || !data) {
      setError('Your comment could not be posted. Please try again.');
      return;
    }
    setComments((prev) => [data as Comment, ...prev]);
    setBody('');
  };

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-stone-900">
        <MessageCircle className="h-5 w-5 text-primary-600" />
        Comments
        {comments.length > 0 && (
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
            {comments.length}
          </span>
        )}
      </h2>

      <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name *"
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Share a word of encouragement…"
            className="resize-none rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={submit}
          disabled={submitting}
          className="mt-3 flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post comment
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-400" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-6 text-sm text-stone-500">No comments yet — be the first to leave a kind word.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                {c.author_name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-stone-50 px-4 py-3">
                <p className="text-sm font-semibold text-stone-900">
                  {c.author_name}
                  <span className="ml-2 text-xs font-normal text-stone-400">{timeAgo(c.created_at)}</span>
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-700">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
