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
    const { imageBase64, fileName } = await req.json();
    
    if (!imageBase64 || !fileName) {
      throw new Error('Missing imageBase64 or fileName');
    }

    const PINATA_JWT = Deno.env.get('PINATA_JWT');
    if (!PINATA_JWT) {
      throw new Error('PINATA_JWT is not configured');
    }

    console.log('Uploading cover image to IPFS:', fileName);

    // Convert base64 to blob
    const base64Data = imageBase64.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Create form data
    const formData = new FormData();
    const blob = new Blob([binaryData]);
    formData.append('file', blob, fileName);

    // Upload to Pinata
    const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Pinata upload error:', errorText);
      throw new Error(`Failed to upload to IPFS: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log('Cover image uploaded to IPFS:', uploadResult.IpfsHash);

    return new Response(
      JSON.stringify({
        ipfsHash: uploadResult.IpfsHash,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in upload-cover-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
