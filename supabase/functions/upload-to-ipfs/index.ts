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
    const PINATA_JWT = Deno.env.get('PINATA_JWT');
    if (!PINATA_JWT) {
      throw new Error('PINATA_JWT not configured');
    }

    const body = await req.json();
    const { title, abstract, content, keywords, publicationType, license, author } = body;

    // Construct IP metadata for Story Protocol
    const metadata = {
      name: title,
      description: abstract,
      content,
      attributes: [
        { trait_type: 'Type', value: publicationType },
        { trait_type: 'Creator', value: `${author.name} (ORCID: ${author.orcid})` },
        { trait_type: 'Network', value: 'Story Testnet' },
        { trait_type: 'Generated', value: new Date().toISOString() },
        { trait_type: 'License', value: license },
      ],
      keywords,
      author,
    };

    console.log('Uploading metadata to IPFS:', metadata);

    // Upload to Pinata
    const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `${title} - KrumpVerse Journal`,
        },
      }),
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }

    const uploadData = await uploadResponse.json();
    const ipfsHash = uploadData.IpfsHash;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log('IPFS upload successful:', { ipfsHash, gatewayUrl });

    return new Response(
      JSON.stringify({
        ipfsHash,
        gatewayUrl,
        ipfsUri: `ipfs://${ipfsHash}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('IPFS upload error:', error);
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
