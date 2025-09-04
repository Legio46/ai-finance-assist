import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      // No customer found, update as unsubscribed
      await supabaseClient.from("profiles").upsert({
        user_id: user.id,
        email: user.email,
        subscription_status: "inactive",
        subscription_tier: null,
        trial_ends_at: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      return new Response(JSON.stringify({ 
        subscribed: false, 
        trial_active: false,
        subscription_tier: null 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
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

      // Determine tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount === 2999) {
        subscriptionTier = "personal";
      } else if (amount === 4999) {
        subscriptionTier = "business";
      }
    }

    // Update profile with subscription info
    await supabaseClient.from("profiles").upsert({
      user_id: user.id,
      email: user.email,
      subscription_status: subscribed ? "active" : "inactive",
      subscription_tier: subscriptionTier,
      trial_ends_at: trialEndsAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    return new Response(JSON.stringify({
      subscribed,
      trial_active: trialActive,
      subscription_tier: subscriptionTier,
      trial_ends_at: trialEndsAt
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});