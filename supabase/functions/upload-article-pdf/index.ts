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
    const { pdfBase64, fileName } = await req.json();
    
    if (!pdfBase64 || !fileName) {
      throw new Error('Missing required fields: pdfBase64 and fileName');
    }

    const PINATA_JWT = Deno.env.get('PINATA_JWT');
    if (!PINATA_JWT) {
      throw new Error('PINATA_JWT not configured');
    }

    console.log('Converting base64 to binary for:', fileName);

    // Convert base64 to binary
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log('PDF size:', bytes.length, 'bytes');

    // Upload PDF to IPFS via Pinata
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob, fileName);

    console.log('Uploading to Pinata...');

    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      console.error('Pinata error:', errorText);
      throw new Error(`Pinata upload failed: ${pinataResponse.status} - ${errorText}`);
    }

    const { IpfsHash } = await pinataResponse.json();
    
    console.log('PDF uploaded successfully. IPFS Hash:', IpfsHash);

    return new Response(
      JSON.stringify({
        ipfsHash: IpfsHash,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${IpfsHash}`,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error: any) {
    console.error('Error in upload-article-pdf:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
