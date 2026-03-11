import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { checkRateLimit, getRateLimitKey, STRICT_RATE_LIMIT } from "../_shared/rateLimit.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  const corsHeaders = getCorsHeaders(req);

  // Rate limiting - 10 requests per minute per user
  const rateLimitKey = getRateLimitKey(req, 'ai-advisor');
  const rateLimitResponse = checkRateLimit(rateLimitKey, STRICT_RATE_LIMIT, corsHeaders);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { message, context, mode = 'personal' } = await req.json();
    
    // Input validation
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: "Message is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message must be less than 2000 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("AI Advisor request received:", { messageLength: message.length, mode });

    const personalPrompt = `You are a friendly personal finance AI assistant for Legio Financial.
Your expertise includes:
- Personal budgeting and expense management
- Savings strategies and goal planning
- Investment basics and portfolio guidance
- Spending pattern analysis and optimization
- Income tracking and financial health assessment
- Debt management and repayment strategies

Provide clear, actionable personal finance advice. Be supportive and encouraging.
If the user's context includes financial data, use it to give personalized recommendations.
Keep responses concise (2-3 paragraphs) unless asked for detailed explanations.
Respond in English.`;

    const supportPrompt = `You are a helpful customer support AI assistant for Legio Financial platform.
Your role is to help users with:
- Navigating the Legio platform (dashboard, features, settings)
- Understanding subscription plans (Personal Basic at €5/month, Personal Pro at €10/month, Business coming soon)
- Personal Basic features: expense tracking, income tracking, budget management, dashboard analytics, data export (CSV/PDF)
- Personal Pro features: everything in Basic plus recurring payments, investment tracking, financial calendar, AI calendar suggestions, financial planner
- Account management (profile, security settings, two-factor authentication)
- Technical issues and troubleshooting
- Currency converter (free, no login required)
- Affiliate program questions
- The platform serves users globally and supports multiple currencies

Be helpful, patient, and guide users step by step. If you don't know something specific about the platform, say so honestly.
Respond in English.`;

    const systemPrompt = mode === 'support' ? supportPrompt : personalPrompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context ? `Context: ${JSON.stringify(context)}\n\nQuestion: ${message}` : message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in ai-advisor function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
