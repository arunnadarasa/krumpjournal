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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { articleId, ipfsHash, metadata } = body;

    console.log('Starting Story minting for article:', articleId);

    // Update article status to minting
    await supabaseClient
      .from('articles')
      .update({ status: 'minting' })
      .eq('id', articleId);

    // Note: Actual Story minting would happen here
    // For now, we'll simulate the minting process
    // In production, you would:
    // 1. Use viem to connect to Story Protocol
    // 2. Call the SPG contract's mint function
    // 3. Wait for transaction confirmation
    
    // Simulated transaction data
    const simulatedTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const simulatedIpAssetId = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;

    console.log('Minting simulation:', {
      txHash: simulatedTxHash,
      ipAssetId: simulatedIpAssetId,
    });

    // Update article with minting results
    const { error: updateError } = await supabaseClient
      .from('articles')
      .update({
        status: 'minted',
        transaction_hash: simulatedTxHash,
        ip_asset_id: simulatedIpAssetId,
        spg_contract_address: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc',
        minted_at: new Date().toISOString(),
      })
      .eq('id', articleId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        transactionHash: simulatedTxHash,
        ipAssetId: simulatedIpAssetId,
        message: 'Article minted successfully (simulated)',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Minting error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Update article status to failed if we have the articleId
    try {
      const body = await req.json();
      const { articleId } = body;
      if (articleId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        await supabaseClient
          .from('articles')
          .update({ status: 'failed' })
          .eq('id', articleId);
      }
    } catch (e) {
      console.error('Failed to update article status:', e);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
