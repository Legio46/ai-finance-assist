import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // User client to verify the requesting user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get requesting user
    const { data: { user: requestingUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Server-side admin role verification
    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Admin check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { action, targetUserId, data } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing action parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    switch (action) {
      case "deleteUser":
        if (!targetUserId) {
          return new Response(
            JSON.stringify({ error: "Missing targetUserId" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Prevent self-deletion
        if (targetUserId === requestingUser.id) {
          return new Response(
            JSON.stringify({ error: "Cannot delete your own account" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Delete user using admin API
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId);
        if (deleteError) throw deleteError;

        // Log the action
        await adminClient.from("admin_activity_logs").insert({
          admin_user_id: requestingUser.id,
          action: "DELETE_USER",
          target_user_id: targetUserId,
          details: { deleted_by: requestingUser.email },
        });

        result = { success: true, message: "User deleted successfully" };
        break;

      case "updateUser":
        if (!targetUserId || !data) {
          return new Response(
            JSON.stringify({ error: "Missing targetUserId or data" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update profile
        const { error: updateError } = await adminClient
          .from("profiles")
          .update({
            full_name: data.full_name,
            subscription_tier: data.subscription_tier,
            subscription_status: data.subscription_status,
            account_type: data.account_type,
          })
          .eq("user_id", targetUserId);

        if (updateError) throw updateError;

        // Update roles if specified
        if (data.role !== undefined) {
          // Remove existing roles
          await adminClient
            .from("user_roles")
            .delete()
            .eq("user_id", targetUserId);

          // Add admin role if specified
          if (data.role === "admin") {
            const { error: roleInsertError } = await adminClient
              .from("user_roles")
              .insert({ user_id: targetUserId, role: "admin" });

            if (roleInsertError) throw roleInsertError;
          }
        }

        // Log the action
        await adminClient.from("admin_activity_logs").insert({
          admin_user_id: requestingUser.id,
          action: "UPDATE_USER",
          target_user_id: targetUserId,
          details: { changes: data, updated_by: requestingUser.email },
        });

        result = { success: true, message: "User updated successfully" };
        break;

      case "resolveSecurityEvent":
        if (!data?.eventId) {
          return new Response(
            JSON.stringify({ error: "Missing eventId" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: resolveError } = await adminClient
          .from("security_events")
          .update({
            resolved: true,
            resolved_by: requestingUser.id,
            resolved_at: new Date().toISOString(),
          })
          .eq("id", data.eventId);

        if (resolveError) throw resolveError;

        result = { success: true, message: "Security event resolved" };
        break;

      case "dismissAlert":
        if (!data?.alertId) {
          return new Response(
            JSON.stringify({ error: "Missing alertId" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: dismissError } = await adminClient
          .from("system_alerts")
          .update({ is_dismissed: true })
          .eq("id", data.alertId);

        if (dismissError) throw dismissError;

        result = { success: true, message: "Alert dismissed" };
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Admin operation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
