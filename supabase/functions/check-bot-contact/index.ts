import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required", should_ignore: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if phone exists in bot_contacts (any user)
    const { data, error } = await supabase
      .from("bot_contacts")
      .select("id, name, phone")
      .or(`phone.eq.${normalizedPhone},phone.ilike.%${normalizedPhone}%`)
      .limit(1);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Database error", should_ignore: false }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const shouldIgnore = data && data.length > 0;
    const contact = shouldIgnore ? data[0] : null;

    return new Response(
      JSON.stringify({
        should_ignore: shouldIgnore,
        contact_name: contact?.name || null,
        message: shouldIgnore 
          ? `Contacto "${contact?.name}" encontrado - bot debe ignorar` 
          : "Contacto no encontrado - bot puede responder"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error", should_ignore: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
