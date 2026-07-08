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
    const { action, appointmentId, appointmentData, userId, startDate, endDate } = await req.json();
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get user's Google Calendar tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'No Google Calendar connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Refresh token if expired
    let accessToken = tokenData.access_token;
    const tokenExpiry = new Date(tokenData.token_expiry);
    
    if (tokenExpiry <= new Date()) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: tokenData.refresh_token,
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;
      
      const newExpiry = new Date(Date.now() + (refreshData.expires_in * 1000));
      
      await supabase
        .from('google_calendar_tokens')
        .update({ 
          access_token: accessToken,
          token_expiry: newExpiry.toISOString() 
        })
        .eq('user_id', userId);
    }

    // Perform the requested action
    if (action === 'create') {
      // Validate time range
      const startTime = new Date(appointmentData.start_time);
      const endTime = new Date(appointmentData.end_time);
      
      if (endTime <= startTime) {
        return new Response(
          JSON.stringify({ error: 'La hora de fin debe ser posterior a la hora de inicio' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build event title with patient info
      let eventTitle = appointmentData.title;
      if (appointmentData.patient_name) {
        eventTitle = `Cita: ${appointmentData.patient_name} - ${appointmentData.title}`;
      }

      // Build event description with all details
      let eventDescription = appointmentData.description || '';
      const detailsParts = [];
      
      if (appointmentData.patient_name) {
        detailsParts.push(`🐾 Mascota: ${appointmentData.patient_name}`);
      }
      if (appointmentData.owner_name) {
        detailsParts.push(`👤 Dueño: ${appointmentData.owner_name}`);
      }
      if (appointmentData.type) {
        detailsParts.push(`📋 Tipo: ${appointmentData.type}`);
      }
      if (appointmentData.veterinarian) {
        detailsParts.push(`👨‍⚕️ Veterinario: ${appointmentData.veterinarian}`);
      }
      
      if (detailsParts.length > 0) {
        eventDescription = detailsParts.join('\n') + (eventDescription ? '\n\n' + eventDescription : '');
      }

      const event = {
        summary: eventTitle,
        description: eventDescription,
        start: {
          dateTime: appointmentData.start_time,
          timeZone: 'America/Mexico_City',
        },
        end: {
          dateTime: appointmentData.end_time,
          timeZone: 'America/Mexico_City',
        },
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${tokenData.calendar_id}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      const createdEvent = await response.json();
      
      if (createdEvent.error) {
        throw new Error(createdEvent.error.message);
      }

      // Update appointment with Google Calendar event ID
      await supabase
        .from('appointments')
        .update({ google_calendar_event_id: createdEvent.id })
        .eq('id', appointmentId);

      return new Response(
        JSON.stringify({ success: true, eventId: createdEvent.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'update') {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('google_calendar_event_id')
        .eq('id', appointmentId)
        .single();

      if (!appointment?.google_calendar_event_id) {
        throw new Error('No Google Calendar event ID found');
      }

      // Build event title with patient info
      let eventTitle = appointmentData.title;
      if (appointmentData.patient_name) {
        eventTitle = `Cita: ${appointmentData.patient_name} - ${appointmentData.title}`;
      }

      // Build event description with all details
      let eventDescription = appointmentData.description || '';
      const detailsParts = [];
      
      if (appointmentData.patient_name) {
        detailsParts.push(`🐾 Mascota: ${appointmentData.patient_name}`);
      }
      if (appointmentData.owner_name) {
        detailsParts.push(`👤 Dueño: ${appointmentData.owner_name}`);
      }
      if (appointmentData.type) {
        detailsParts.push(`📋 Tipo: ${appointmentData.type}`);
      }
      if (appointmentData.veterinarian) {
        detailsParts.push(`👨‍⚕️ Veterinario: ${appointmentData.veterinarian}`);
      }
      
      if (detailsParts.length > 0) {
        eventDescription = detailsParts.join('\n') + (eventDescription ? '\n\n' + eventDescription : '');
      }

      const event = {
        summary: eventTitle,
        description: eventDescription,
        start: {
          dateTime: appointmentData.start_time,
          timeZone: 'America/Mexico_City',
        },
        end: {
          dateTime: appointmentData.end_time,
          timeZone: 'America/Mexico_City',
        },
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${tokenData.calendar_id}/events/${appointment.google_calendar_event_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      const updatedEvent = await response.json();
      
      if (updatedEvent.error) {
        throw new Error(updatedEvent.error.message);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'delete') {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('google_calendar_event_id')
        .eq('id', appointmentId)
        .single();

      if (appointment?.google_calendar_event_id) {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${tokenData.calendar_id}/events/${appointment.google_calendar_event_id}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'list') {
      // Fetch events from Google Calendar
      const params = new URLSearchParams({
        timeMin: startDate || new Date().toISOString(),
        timeMax: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${tokenData.calendar_id}/events?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const eventsData = await response.json();
      
      if (eventsData.error) {
        throw new Error(eventsData.error.message);
      }

      return new Response(
        JSON.stringify({ success: true, events: eventsData.items || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in google-calendar-sync:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});