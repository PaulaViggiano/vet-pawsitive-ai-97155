import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, userId, action } = await req.json();
    
    // Handle get_auth_url action
    if (action === 'get_auth_url') {
      const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
      const GOOGLE_REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI');
      
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Missing Google Client ID');
      }

      // Use redirect URI from vault or construct from request origin
      const redirectUri = GOOGLE_REDIRECT_URI || `${req.headers.get('origin') || 'https://vet-pawsitive-ai-97155.lovable.app'}/auth/callback`;
      
      console.log('Auth URL generation - Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
      console.log('Auth URL generation - Redirect URI:', redirectUri);

      const scope = 'https://www.googleapis.com/auth/calendar';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      return new Response(
        JSON.stringify({ authUrl, redirectUri }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle token exchange
    if (!code || !userId) {
      throw new Error('Missing code or userId');
    }

    console.log('Processing OAuth callback for user:', userId);

    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const GOOGLE_REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Missing Google OAuth credentials');
    }

    // Use redirect URI from vault or construct from request origin
    const redirectUri = GOOGLE_REDIRECT_URI || `${req.headers.get('origin') || 'https://vet-pawsitive-ai-97155.lovable.app'}/auth/callback`;
    
    console.log('Token exchange - Redirect URI:', redirectUri);
    console.log('Token exchange - User ID:', userId);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user's primary calendar
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList/primary', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const calendar = await calendarResponse.json();

    // Calculate token expiry
    const tokenExpiry = new Date(Date.now() + (tokens.expires_in * 1000));

    // Store tokens in database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { error: upsertError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokenExpiry.toISOString(),
        calendar_id: calendar.id,
      });

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({ success: true, calendarId: calendar.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-calendar-oauth:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});