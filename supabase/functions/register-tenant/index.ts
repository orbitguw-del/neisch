import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const admin = createClient(supabaseUrl, serviceKey)

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  let createdUserId: string | null = null

  try {
    const { email, password, full_name, tenant_name } = await req.json()
    if (!email || !password || !tenant_name) {
      return json({ error: "Missing email, password, or tenant_name" }, 400)
    }

    // Step 1: create auth user (email_confirm true so they can sign in immediately).
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name ?? null },
    })
    if (createError || !userData?.user) {
      return json({ error: createError?.message ?? "Failed to create account" }, 400)
    }
    createdUserId = userData.user.id

    // Step 2: insert tenant — owned by the new user.
    const { error: tenantError } = await admin
      .from("tenants")
      .insert({ name: tenant_name, owner_id: createdUserId })

    if (tenantError) {
      // Rollback: delete the orphaned auth user.
      await admin.auth.admin.deleteUser(createdUserId).catch((e) =>
        console.error("Rollback failed for user", createdUserId, e)
      )
      return json({ error: `Failed to create company: ${tenantError.message}` }, 400)
    }

    return json({ success: true, user_id: createdUserId })
  } catch (error) {
    // Best-effort rollback on any unexpected error after user creation.
    if (createdUserId) {
      await admin.auth.admin.deleteUser(createdUserId).catch((e) =>
        console.error("Rollback failed for user", createdUserId, e)
      )
    }
    return json({ error: (error as Error).message }, 500)
  }
})
