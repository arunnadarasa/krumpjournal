import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, userId } = await req.json();
    
    if (!code || !userId) {
      throw new Error('Missing code or userId');
    }

    const orcidClientId = Deno.env.get('ORCID_CLIENT_ID');
    const orcidClientSecret = Deno.env.get('ORCID_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://orcid.org/oauth/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: orcidClientId!,
        client_secret: orcidClientSecret!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${req.headers.get('origin')}/orcid/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('ORCID token exchange error:', error);
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const { orcid, name, access_token } = tokenData;

    console.log('ORCID verification successful:', { orcid, name });

    // Update user profile with verified ORCID
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        orcid_id: orcid,
        orcid_name: name,
        orcid_verified: true,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      throw new Error('Failed to update profile');
    }

    return new Response(
      JSON.stringify({
        success: true,
        orcid,
        name,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('ORCID callback error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});