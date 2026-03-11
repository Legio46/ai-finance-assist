import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getRateLimitKey, STRICT_RATE_LIMIT } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Rate limiting
  const rateLimitKey = getRateLimitKey(req, 'ai-personal-insights');
  const rateLimitResponse = checkRateLimit(rateLimitKey, STRICT_RATE_LIMIT, corsHeaders);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Fetch all relevant data in parallel
    const [expensesRes, incomeRes, budgetsRes, recurringRes] = await Promise.all([
      supabase.from("personal_expenses").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(200),
      supabase.from("income_sources").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("budgets").select("*").eq("user_id", user.id),
      supabase.from("recurring_payments").select("*").eq("user_id", user.id).eq("is_active", true),
    ]);

    const expenses = expensesRes.data || [];
    const income = incomeRes.data || [];
    const budgets = budgetsRes.data || [];
    const recurring = recurringRes.data || [];

    // Build a summary for the AI
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    const categoryTotals: Record<string, number> = {};
    thisMonthExpenses.forEach((e: any) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
    });

    const lastMonthCategoryTotals: Record<string, number> = {};
    lastMonthExpenses.forEach((e: any) => {
      lastMonthCategoryTotals[e.category] = (lastMonthCategoryTotals[e.category] || 0) + Number(e.amount);
    });

    const totalMonthlyIncome = income.reduce((sum: number, i: any) => {
      if (i.frequency === "monthly") return sum + Number(i.amount);
      if (i.frequency === "weekly") return sum + Number(i.amount) * 4.33;
      if (i.frequency === "bi-weekly") return sum + Number(i.amount) * 2.17;
      if (i.frequency === "yearly") return sum + Number(i.amount) / 12;
      return sum + Number(i.amount);
    }, 0);

    const totalMonthlyExpenses = thisMonthExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    // Uncategorized or vague expenses
    const uncategorizedExpenses = thisMonthExpenses.filter((e: any) =>
      !e.category || e.category === "Other"
    ).slice(0, 10);

    // Detect potential recurring patterns (expenses with similar amounts appearing multiple months)
    const expensePatterns: Record<string, { count: number; amount: number; description: string }> = {};
    expenses.forEach((e: any) => {
      const key = `${e.category}-${Math.round(Number(e.amount))}`;
      if (!expensePatterns[key]) {
        expensePatterns[key] = { count: 0, amount: Number(e.amount), description: e.description || e.category };
      }
      expensePatterns[key].count++;
    });
    const potentialRecurring = Object.values(expensePatterns)
      .filter((p) => p.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Already tracked recurring names
    const existingRecurringNames = recurring.map((r: any) => r.payment_name.toLowerCase());

    const dataSummary = `
USER FINANCIAL DATA SUMMARY:
- Total monthly income: ${totalMonthlyIncome.toFixed(2)}
- This month's expenses: ${totalMonthlyExpenses.toFixed(2)}
- Savings rate: ${totalMonthlyIncome > 0 ? (((totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome) * 100).toFixed(1) : "N/A"}%
- Category breakdown this month: ${JSON.stringify(categoryTotals)}
- Category breakdown last month: ${JSON.stringify(lastMonthCategoryTotals)}
- Current budgets: ${JSON.stringify(budgets.map((b: any) => ({ category: b.category, amount: b.amount, period: b.period })))}
- Active recurring payments: ${JSON.stringify(recurring.map((r: any) => ({ name: r.payment_name, amount: r.amount, frequency: r.frequency })))}
- Uncategorized/Other expenses this month: ${JSON.stringify(uncategorizedExpenses.map((e: any) => ({ description: e.description, amount: e.amount })))}
- Potential recurring patterns detected: ${JSON.stringify(potentialRecurring)}
- Already tracked recurring names: ${JSON.stringify(existingRecurringNames)}
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a personal finance AI assistant. Analyze the user's financial data and provide actionable insights. Return structured output using the provided tool.`;

    const userPrompt = `${dataSummary}

Analyze this data and provide:
1. spending_insights: 2-4 key observations about spending patterns, trends vs last month, and areas of concern or improvement.
2. budget_suggestions: 2-3 budget recommendations for categories where the user doesn't have budgets or where spending exceeds budget. Include suggested amounts.
3. auto_categories: For any "Other" or uncategorized expenses, suggest better categories.
4. recurring_detection: Identify expenses that look recurring but aren't tracked as recurring payments yet. Only suggest ones not already in the recurring payments list.

Be concise, specific, and actionable. Use actual numbers from the data.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_insights",
              description: "Return structured financial insights",
              parameters: {
                type: "object",
                properties: {
                  spending_insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        type: { type: "string", enum: ["positive", "warning", "neutral", "alert"] },
                      },
                      required: ["title", "description", "type"],
                      additionalProperties: false,
                    },
                  },
                  budget_suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        suggested_amount: { type: "number" },
                        reason: { type: "string" },
                      },
                      required: ["category", "suggested_amount", "reason"],
                      additionalProperties: false,
                    },
                  },
                  auto_categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        expense_description: { type: "string" },
                        current_category: { type: "string" },
                        suggested_category: { type: "string" },
                      },
                      required: ["expense_description", "current_category", "suggested_category"],
                      additionalProperties: false,
                    },
                  },
                  recurring_detection: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        estimated_amount: { type: "number" },
                        frequency: { type: "string", enum: ["weekly", "monthly", "yearly"] },
                      },
                      required: ["name", "estimated_amount", "frequency"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["spending_insights", "budget_suggestions", "auto_categories", "recurring_detection"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_insights" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const insights = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-personal-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
