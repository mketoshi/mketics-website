import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          quote: "OPENAI_API_KEY is missing in Supabase secrets.",
          error: "OPENAI_API_KEY is missing in Supabase secrets.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: `Create a professional MKETICS proposal for:
Client: ${body.clientName || "Demo Client"}
Company: ${body.company || "Client Company"}
Service: ${body.service || "Business Technology Solution"}
Budget: ${body.budget || "Not provided"}
Requirements: ${body.requirements || "No requirements provided"}

Include executive summary, scope, technical plan, timeline, pricing in ZAR, payment terms, and closing statement.`,
      }),
    });

    const text = await openaiResponse.text();

    if (!openaiResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          quote: `OpenAI failed:\n\n${text}`,
          error: text,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(text);

    const quote =
      result.output_text ||
      result.output?.[0]?.content?.[0]?.text ||
      "OpenAI responded, but no text was returned.";

    return new Response(
      JSON.stringify({ success: true, quote }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        quote: `Edge Function error:\n\n${error?.message || "Unknown error"}`,
        error: error?.message || "Unknown error",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});