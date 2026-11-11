import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method === "GET") {
      const [campaignsRes, withdrawalsRes, inquiriesRes, categoriesRes, donationsRes, faqsRes] = await Promise.all([
        supabase.from("campaigns").select("*, categories(id, name, slug)").order("created_at", { ascending: false }),
        supabase.from("withdrawals").select("*, campaigns(id, title)").order("requested_at", { ascending: false }),
        supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
        supabase.from("donations").select("amount, donor_email, created_at"),
        supabase.from("faqs").select("*").order("sort_order"),
      ]);

      const first = campaignsRes.error ?? withdrawalsRes.error ?? inquiriesRes.error ?? categoriesRes.error ?? donationsRes.error ?? faqsRes.error;
      if (first) return json({ error: first.message }, 500);

      const donations = donationsRes.data ?? [];
      const donors = new Set(donations.map((d) => d.donor_email ?? `anon-${d.created_at}`));

      return json({
        campaigns: campaignsRes.data,
        withdrawals: withdrawalsRes.data,
        inquiries: inquiriesRes.data,
        categories: categoriesRes.data,
        faqs: faqsRes.data,
        stats: {
          totalRaised: donations.reduce((sum, d) => sum + Number(d.amount), 0),
          donationCount: donations.length,
          donorCount: donors.size,
          campaignCount: (campaignsRes.data ?? []).length,
          pendingCount: (campaignsRes.data ?? []).filter((c: { status: string }) => c.status === "pending").length,
          pendingWithdrawals: (withdrawalsRes.data ?? []).filter((w: { status: string }) => w.status === "pending").length,
        },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { action } = body;

      switch (action) {
        case "set_campaign_status": {
          const { id, status } = body;
          if (!id || !["pending", "approved", "rejected"].includes(status)) {
            return json({ error: "Invalid campaign status request" }, 400);
          }
          const { error } = await supabase.from("campaigns").update({ status }).eq("id", id);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        case "toggle_featured": {
          const { id, featured } = body;
          const { error } = await supabase.from("campaigns").update({ featured: Boolean(featured) }).eq("id", id);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        case "delete_campaign": {
          const { id } = body;
          const { error } = await supabase.from("campaigns").delete().eq("id", id);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        case "process_withdrawal": {
          const { id, status } = body;
          if (!id || !["approved", "rejected"].includes(status)) {
            return json({ error: "Invalid withdrawal decision" }, 400);
          }
          const { error } = await supabase
            .from("withdrawals")
            .update({ status, processed_at: new Date().toISOString() })
            .eq("id", id);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        case "handle_inquiry": {
          const { id } = body;
          const { error } = await supabase.from("inquiries").update({ handled: true }).eq("id", id);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        case "add_category": {
          const name = String(body.name ?? "").trim();
          if (!name) return json({ error: "Category name is required" }, 400);
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const { error } = await supabase.from("categories").insert({ name, slug });
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        case "add_faq": {
          const question = String(body.question ?? "").trim();
          const answer = String(body.answer ?? "").trim();
          if (!question || !answer) return json({ error: "Question and answer are required" }, 400);
          const { error } = await supabase.from("faqs").insert({
            question,
            answer,
            sort_order: Number(body.sort_order) || 0,
          });
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        case "update_faq": {
          const { id, question, answer } = body;
          if (!id || !String(question ?? "").trim() || !String(answer ?? "").trim()) {
            return json({ error: "Question and answer are required" }, 400);
          }
          const { error } = await supabase
            .from("faqs")
            .update({ question: String(question).trim(), answer: String(answer).trim() })
            .eq("id", id);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        case "delete_faq": {
          const { id } = body;
          if (!id) return json({ error: "Missing FAQ id" }, 400);
          const { error } = await supabase.from("faqs").delete().eq("id", id);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }
        default:
          return json({ error: "Unknown action" }, 400);
      }
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
