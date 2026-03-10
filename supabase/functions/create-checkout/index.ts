import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  const corsHeaders = getCorsHeaders(req);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase configuration");
    if (!stripeSecretKey) throw new Error("Missing Stripe configuration");

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) return new Response(JSON.stringify({ error: "Authentication failed" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const user = userData.user;
    let requestBody;
    try { requestBody = await req.json(); } catch { return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

    const { plan, billingPeriod = 'monthly' } = requestBody;
    if (!plan || !['basic', 'pro'].includes(plan)) return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const stripe = await import("npm:stripe@14.21.0");
    const stripeClient = new stripe.default(stripeSecretKey, { apiVersion: "2023-10-16" });

    const customers = await stripeClient.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    // Monthly and annual pricing (amounts in cents)
    const prices = {
      basic: { monthly: 500, annual: 5400, name: "Personal Basic" },   // €5/mo or €54/yr (10% off)
      pro: { monthly: 1000, annual: 9600, name: "Personal Pro" },      // €10/mo or €96/yr (20% off)
    };

    const selectedPlan = prices[plan as keyof typeof prices];
    const isAnnual = billingPeriod === 'annual';
    const amount = isAnnual ? selectedPlan.annual : selectedPlan.monthly;
    const interval = isAnnual ? 'year' : 'month';
    const discountLabel = isAnnual ? (plan === 'basic' ? ' (10% off)' : ' (20% off)') : '';

    const origin = req.headers.get("origin") || "https://ehohaixttjnvoylviuda.lovable.app";

    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: selectedPlan.name,
            description: `Legio Finance ${selectedPlan.name} - ${isAnnual ? 'Annual' : 'Monthly'}${discountLabel} - 7-day free trial included`,
          },
          unit_amount: amount,
          recurring: { interval },
        },
        quantity: 1,
      }],
      mode: "subscription",
      subscription_data: { trial_period_days: 7 },
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});