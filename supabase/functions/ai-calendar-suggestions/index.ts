import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's financial data
    const [
      { data: expenses },
      { data: recurringPayments },
      { data: incomeSources },
      { data: goals },
      { data: existingEvents },
    ] = await Promise.all([
      supabase.from("personal_expenses").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(50),
      supabase.from("recurring_payments").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("income_sources").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("financial_goals").select("*").eq("user_id", user.id),
      supabase.from("calendar_events").select("*").eq("user_id", user.id),
    ]);

    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    const financialContext = {
      expenses: expenses?.slice(0, 20) || [],
      recurringPayments: recurringPayments || [],
      incomeSources: incomeSources || [],
      goals: goals || [],
      existingEvents: existingEvents || [],
      currentDate: today.toISOString().split("T")[0],
      nextMonthEnd: nextMonth.toISOString().split("T")[0],
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a financial calendar AI assistant. Analyze the user's financial data and suggest calendar events they should add. Focus on:
1. Patterns in their spending (e.g., if they regularly pay for something monthly, suggest adding it as a recurring event)
2. Upcoming bills based on recurring payments that might not be on their calendar
3. Savings milestones based on their goals
4. Income dates they might want to track
5. Important financial dates (tax deadlines, etc.)

Current date: ${financialContext.currentDate}
Only suggest events between now and ${financialContext.nextMonthEnd}.
Do NOT suggest events that already exist in their calendar.`;

    const userMessage = `Here's my financial data:

RECENT EXPENSES (last 20):
${JSON.stringify(financialContext.expenses, null, 2)}

RECURRING PAYMENTS:
${JSON.stringify(financialContext.recurringPayments, null, 2)}

INCOME SOURCES:
${JSON.stringify(financialContext.incomeSources, null, 2)}

FINANCIAL GOALS:
${JSON.stringify(financialContext.goals, null, 2)}

EXISTING CALENDAR EVENTS:
${JSON.stringify(financialContext.existingEvents, null, 2)}

Analyze my financial patterns and suggest calendar events I should add. Be specific with dates and amounts.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_calendar_events",
              description: "Suggest calendar events based on financial analysis",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        event_name: { type: "string", description: "Name of the suggested event" },
                        event_type: { type: "string", enum: ["bill", "income", "investment", "goal", "custom"], description: "Type of event" },
                        amount: { type: "number", description: "Amount associated with the event" },
                        suggested_date: { type: "string", description: "Suggested date in YYYY-MM-DD format" },
                        reason: { type: "string", description: "Why this event is suggested" },
                      },
                      required: ["event_name", "event_type", "amount", "suggested_date", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_calendar_events" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI API error:", status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "suggest_calendar_events") {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-calendar-suggestions:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
