import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
    const [expensesRes, incomeRes, recurringRes, investmentsRes, goalsRes, budgetsRes] = await Promise.all([
      supabase.from("personal_expenses").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(300),
      supabase.from("income_sources").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("recurring_payments").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("investments").select("*").eq("user_id", user.id),
      supabase.from("financial_goals").select("*").eq("user_id", user.id),
      supabase.from("budgets").select("*").eq("user_id", user.id),
    ]);

    const expenses = expensesRes.data || [];
    const income = incomeRes.data || [];
    const recurring = recurringRes.data || [];
    const investments = investmentsRes.data || [];
    const goals = goalsRes.data || [];
    const budgets = budgetsRes.data || [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Monthly income calculation
    const totalMonthlyIncome = income.reduce((sum: number, i: any) => {
      if (i.frequency === "monthly") return sum + Number(i.amount);
      if (i.frequency === "weekly") return sum + Number(i.amount) * 4.33;
      if (i.frequency === "bi-weekly") return sum + Number(i.amount) * 2.17;
      if (i.frequency === "annually") return sum + Number(i.amount) / 12;
      return sum + Number(i.amount);
    }, 0);

    // This month expenses
    const thisMonthExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const totalMonthlyExpenses = thisMonthExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    // Category breakdown (last 3 months)
    const last3MonthsExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date);
      const monthsDiff = (currentYear - d.getFullYear()) * 12 + (currentMonth - d.getMonth());
      return monthsDiff >= 0 && monthsDiff < 3;
    });
    const categoryTotals3m: Record<string, number> = {};
    last3MonthsExpenses.forEach((e: any) => {
      categoryTotals3m[e.category] = (categoryTotals3m[e.category] || 0) + Number(e.amount);
    });

    // Monthly recurring total
    const totalRecurring = recurring.reduce((sum: number, r: any) => {
      if (r.frequency === "monthly") return sum + Number(r.amount);
      if (r.frequency === "weekly") return sum + Number(r.amount) * 4.33;
      if (r.frequency === "annually") return sum + Number(r.amount) / 12;
      return sum + Number(r.amount);
    }, 0);

    // Investment summary
    const investmentSummary = investments.map((inv: any) => ({
      name: inv.investment_name,
      type: inv.investment_type,
      purchasePrice: inv.purchase_price,
      currentPrice: inv.current_price,
      quantity: inv.quantity,
      totalValue: inv.current_price * inv.quantity,
      returnPct: ((inv.current_price - inv.purchase_price) / inv.purchase_price * 100).toFixed(1),
    }));
    const totalInvestmentValue = investmentSummary.reduce((sum: number, i: any) => sum + i.totalValue, 0);

    // Goals summary
    const goalsSummary = goals.map((g: any) => ({
      name: g.goal_name,
      target: g.target_amount,
      current: g.current_amount || 0,
      progress: g.target_amount > 0 ? ((g.current_amount || 0) / g.target_amount * 100).toFixed(1) : "0",
      targetDate: g.target_date,
    }));

    const dataSummary = `
USER FINANCIAL PROFILE:
- Monthly income: ${totalMonthlyIncome.toFixed(2)}
- This month's spending: ${totalMonthlyExpenses.toFixed(2)}
- Monthly net (income - expenses): ${(totalMonthlyIncome - totalMonthlyExpenses).toFixed(2)}
- Savings rate: ${totalMonthlyIncome > 0 ? (((totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome) * 100).toFixed(1) : "N/A"}%
- Total recurring payments: ${totalRecurring.toFixed(2)}/month
- Recurring payments: ${JSON.stringify(recurring.map((r: any) => ({ name: r.payment_name, amount: r.amount, frequency: r.frequency, category: r.category })))}
- Spending by category (last 3 months): ${JSON.stringify(categoryTotals3m)}
- Budgets set: ${JSON.stringify(budgets.map((b: any) => ({ category: b.category, amount: b.amount })))}
- Investment portfolio: ${JSON.stringify(investmentSummary)}
- Total investment value: ${totalInvestmentValue.toFixed(2)}
- Financial goals: ${JSON.stringify(goalsSummary)}
- Number of expense records analyzed: ${expenses.length}
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert financial planner AI. Analyze the user's complete financial data and provide comprehensive, actionable suggestions across multiple categories. Be specific with numbers, percentages, and timeframes. Tailor advice to the user's actual financial situation.`;

    const userPrompt = `${dataSummary}

Based on this complete financial picture, provide detailed AI suggestions across these categories:

1. savings_tips: 3-5 specific, actionable ways to save more money based on their actual spending patterns. Reference specific categories and amounts.

2. investment_advice: 2-4 investment suggestions based on their current portfolio composition, risk exposure, and diversification. Consider their income level and goals.

3. debt_strategy: 2-3 strategies for managing recurring payments, reducing unnecessary subscriptions, and optimizing payment timing. If recurring costs are high relative to income, flag this.

4. tax_optimization: 2-3 tax-saving suggestions relevant to personal finance (e.g., retirement contributions, deductible expenses, tax-loss harvesting if applicable).

5. goal_acceleration: For each financial goal, suggest specific strategies to reach it faster. If no goals exist, suggest goals they should set based on their financial profile.

6. risk_alerts: 1-3 financial risks or red flags detected in their data (e.g., no emergency fund, over-concentration in one investment type, spending exceeding income, no insurance considerations).

7. monthly_action_plan: 3-5 specific actions they should take THIS MONTH to improve their financial health, ordered by priority.

Be direct, use actual numbers from their data, and avoid generic advice.`;

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
              name: "provide_planner_suggestions",
              description: "Return structured financial planning suggestions",
              parameters: {
                type: "object",
                properties: {
                  savings_tips: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        potential_savings: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["title", "description", "potential_savings", "priority"],
                      additionalProperties: false,
                    },
                  },
                  investment_advice: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        risk_level: { type: "string", enum: ["low", "medium", "high"] },
                        timeframe: { type: "string" },
                      },
                      required: ["title", "description", "risk_level", "timeframe"],
                      additionalProperties: false,
                    },
                  },
                  debt_strategy: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        estimated_impact: { type: "string" },
                      },
                      required: ["title", "description", "estimated_impact"],
                      additionalProperties: false,
                    },
                  },
                  tax_optimization: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        potential_benefit: { type: "string" },
                      },
                      required: ["title", "description", "potential_benefit"],
                      additionalProperties: false,
                    },
                  },
                  goal_acceleration: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        goal_name: { type: "string" },
                        strategy: { type: "string" },
                        time_saved: { type: "string" },
                      },
                      required: ["goal_name", "strategy", "time_saved"],
                      additionalProperties: false,
                    },
                  },
                  risk_alerts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        severity: { type: "string", enum: ["critical", "warning", "info"] },
                        action: { type: "string" },
                      },
                      required: ["title", "description", "severity", "action"],
                      additionalProperties: false,
                    },
                  },
                  monthly_action_plan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        action: { type: "string" },
                        reason: { type: "string" },
                        priority: { type: "number" },
                      },
                      required: ["action", "reason", "priority"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["savings_tips", "investment_advice", "debt_strategy", "tax_optimization", "goal_acceleration", "risk_alerts", "monthly_action_plan"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_planner_suggestions" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const suggestions = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-planner-suggestions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
