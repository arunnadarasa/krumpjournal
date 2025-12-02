import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      ipaMetadataUri, 
      ipaMetadataHash, 
      nftMetadataUri, 
      nftMetadataHash,
      network 
    } = body;

    console.log('Starting Story minting...');
    console.log('Network:', network);
    console.log('IPA Metadata URI:', ipaMetadataUri);
    console.log('IPA Metadata Hash:', ipaMetadataHash);
    console.log('NFT Metadata URI:', nftMetadataUri);
    console.log('NFT Metadata Hash:', nftMetadataHash);

    // Note: Actual Story minting would happen here using Story SDK
    // const response = await client.ipAsset.mintAndRegisterIp({
    //   spgNftContract: SPG_NFT_CONTRACT,
    //   ipMetadata: {
    //     ipMetadataURI: ipaMetadataUri,
    //     ipMetadataHash: ipaMetadataHash,
    //     nftMetadataURI: nftMetadataUri,
    //     nftMetadataHash: nftMetadataHash,
    //   },
    // });
    
    // Simulated transaction data
    const simulatedTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const simulatedIpAssetId = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
    const spgContractAddress = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';

    console.log('Minting simulation completed:', {
      txHash: simulatedTxHash,
      ipAssetId: simulatedIpAssetId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        transactionHash: simulatedTxHash,
        ipAssetId: simulatedIpAssetId,
        spgContractAddress,
        message: 'Article minted successfully (simulated)',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Minting error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
