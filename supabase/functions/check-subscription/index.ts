import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    if (!stripeSecretKey) {
      throw new Error("Missing Stripe configuration");
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const user = userData.user;

    const stripe = await import("npm:stripe@14.21.0");
    const stripeClient = new stripe.default(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const customers = await stripeClient.customers.list({ 
      email: user.email, 
      limit: 1 
    });

    if (customers.data.length === 0) {
      await supabaseClient.from("profiles").upsert(
        {
          user_id: user.id,
          email: user.email,
          subscription_status: "inactive",
          subscription_tier: null,
          trial_ends_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      return new Response(
        JSON.stringify({
          subscribed: false,
          trial_active: false,
          subscription_tier: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripeClient.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    let subscribed = false;
    let trialActive = false;
    let subscriptionTier = null;
    let trialEndsAt = null;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      subscribed = subscription.status === "active" || subscription.status === "trialing";
      trialActive = subscription.status === "trialing";

      if (trialActive && subscription.trial_end) {
        trialEndsAt = new Date(subscription.trial_end * 1000).toISOString();
      }

      const priceId = subscription.items.data[0].price.id;
      const price = await stripeClient.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;

      if (amount === 1499) {
        subscriptionTier = "personal";
      } else if (amount === 2999) {
        subscriptionTier = "business";
      }
    }

    await supabaseClient.from("profiles").upsert(
      {
        user_id: user.id,
        email: user.email,
        subscription_status: subscribed ? "active" : "inactive",
        subscription_tier: subscriptionTier,
        trial_ends_at: trialEndsAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return new Response(
      JSON.stringify({
        subscribed,
        trial_active: trialActive,
        subscription_tier: subscriptionTier,
        trial_ends_at: trialEndsAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Subscription check error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});