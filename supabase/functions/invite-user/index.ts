import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Missing authorization header")

    const { email, role, site_id, tenant_id } = await req.json()
    if (!email || !role || !site_id || !tenant_id) throw new Error("Missing required fields")

    // Verify the caller using their own JWT
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized")

    // Verify caller is a contractor belonging to the target tenant
    const { data: profile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("role, tenant_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) throw new Error("Profile not found")
    if (profile.role !== "contractor") throw new Error("Only contractors can invite team members")
    if (profile.tenant_id !== tenant_id) throw new Error("Tenant mismatch")

    // Use service role to send the invite
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000"

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role, site_id, tenant_id, invited_role: role },
      redirectTo: `${siteUrl}/auth/callback`,
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
