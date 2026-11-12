import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

const SITE_NAME = "Future Stars Foundation";
const APP_URL = Deno.env.get("PUBLIC_APP_URL") ?? "";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(url: string, title: string, description: string, image: string | null): string {
  const tags = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ];
  if (image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  }
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    ${tags.join("\n    ")}
    <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
  </head>
  <body>
    <script>window.location.replace(${JSON.stringify(url)});</script>
    <p>Opening ${escapeHtml(title)}… <a href="${escapeHtml(url)}">Continue</a></p>
  </body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const reqUrl = new URL(req.url);
    const campaignId = reqUrl.searchParams.get("campaign");
    if (!campaignId || !/^[0-9a-f-]{36}$/i.test(campaignId)) {
      const fallback = APP_URL || "https://future-stars-foundation.example";
      return new Response(page(fallback, SITE_NAME, `${SITE_NAME} — fundraise, donate, change lives.`, null), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("id, title, description, location, image_url, raised_amount, goal_amount")
      .eq("id", campaignId)
      .eq("status", "approved")
      .maybeSingle();
    if (error || !campaign) {
      const fallback = APP_URL || "https://future-stars-foundation.example";
      return new Response(page(fallback, SITE_NAME, `${SITE_NAME} — fundraise, donate, change lives.`, null), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const target = APP_URL ? `${APP_URL}/campaigns/${campaign.id}` : `/campaigns/${campaign.id}`;
    const pct = Math.min(Math.round((Number(campaign.raised_amount) / Number(campaign.goal_amount)) * 100), 100);
    const title = campaign.location ? `${campaign.title} in ${campaign.location}` : campaign.title;
    const description = campaign.raised_amount > 0
      ? `${pct}% funded on ${SITE_NAME} — add your gift today.`
      : campaign.description;

    return new Response(page(target, title, description, campaign.image_url), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
