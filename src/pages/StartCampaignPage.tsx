import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCategories } from '../lib/hooks';

export function StartCampaignPage() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [goal, setGoal] = useState('');
  const [location, setLocation] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || !description.trim() || !categoryId || !Number(goal)) {
      setError('Please fill in the title, category, goal amount, and description.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { data, error: insertError } = await supabase
      .from('campaigns')
      .insert({
        title: title.trim(),
        description: description.trim(),
        story: description.trim(),
        category_id: categoryId,
        goal_amount: Number(goal),
        image_url: imageUrl.trim() || null,
        location: location.trim() || null,
        creator_name: creatorName.trim() || 'Anonymous Organizer',
        creator_email: creatorEmail.trim() || null,
        status: 'pending',
      })
      .select('id')
      .maybeSingle();
    setSubmitting(false);
    if (insertError || !data) {
      setError('We could not submit your campaign. Please try again.');
      return;
    }
    navigate(`/campaigns/${data.id}?submitted=1`);
  };

  return (
    <div className="bg-stone-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-stone-900">Start a campaign</h1>
          <p className="mx-auto mt-3 max-w-lg text-stone-600">
            Tell us what you are raising money for. Our team reviews every submission — usually within one business day.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-stone-700">Campaign title *</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build a library for Riverside Elementary"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-stone-700">Category *</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="">Choose a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm font-semibold text-stone-700">Goal amount (USD) *</span>
              <input
                type="number"
                min={100}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="10000"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-stone-700">Location</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-stone-700">Photo URL</span>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-stone-700">Your name</span>
              <input
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Organization or your name"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label>
              <span className="text-sm font-semibold text-stone-700">Contact email</span>
              <input
                type="email"
                value={creatorEmail}
                onChange={(e) => setCreatorEmail(e.target.value)}
                placeholder="you@example.org"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold text-stone-700">Tell your story *</span>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you raising funds for? Who does it help? How will the money be used?"
                className="mt-1.5 w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </label>
          </div>

          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            onClick={submit}
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for review
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-stone-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            New campaigns appear publicly once approved by the Future Stars Foundation team
          </p>
        </div>
      </div>
    </div>
  );
}
