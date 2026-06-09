import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── User-scoped client (reads the JWT from the request) ─────────────────
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // ── Verify the user is actually authenticated ───────────────────────────
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // ── Service role client (needed to delete auth user) ────────────────────
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Delete all user data in order (respect FK constraints) ──────────────
    const tables = ["xp_log", "badges", "streaks", "settings", "tasks", "categories"];

    for (const table of tables) {
      const { error } = await adminClient
        .from(table)
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error(`Failed to delete from ${table}:`, error.message);
        // Don't throw - continue deleting other tables
      }
    }

    // ── Delete the auth user itself ──────────────────────────────────────────
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) throw deleteAuthError;

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});