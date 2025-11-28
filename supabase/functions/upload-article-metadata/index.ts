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
    const { 
      title, 
      abstract, 
      content, 
      keywords, 
      publicationType, 
      license, 
      authorName, 
      orcidId,
      coverImageIpfs,
      pdfIpfsHash,
      network 
    } = await req.json();

    const PINATA_JWT = Deno.env.get('PINATA_JWT');
    if (!PINATA_JWT) {
      throw new Error('PINATA_JWT is not configured');
    }

    console.log('Creating metadata for article:', title);

    // Generate DOI
    const timestamp = Date.now();
    const year = new Date().getFullYear();
    const doi = `10.KRUMPJOURNAL/article.${year}.${timestamp}`;
    const doiUrl = `https://doi.org/${doi}`;

    // Network-specific URLs
    const explorerUrl = network === 'testnet' 
      ? 'https://aeneid.explorer.story.foundation'
      : 'https://explorer.story.foundation';
    
    const scanUrl = network === 'testnet'
      ? 'https://aeneid.storyscan.io'
      : 'https://storyscan.io';

    const coverImageUri = coverImageIpfs ? `ipfs://${coverImageIpfs}` : '';

    // Create IPA metadata for Story blockchain
    const ipaMetadata = {
      name: title,
      description: abstract,
      image: coverImageUri,
      external_url: explorerUrl,
      content_url: pdfIpfsHash ? `https://gateway.pinata.cloud/ipfs/${pdfIpfsHash}` : undefined,
      attributes: [
        { trait_type: 'DOI', value: doi },
        { trait_type: 'Type', value: publicationType },
        { trait_type: 'Creator', value: `${authorName} (ORCID: ${orcidId})` },
        { trait_type: 'Network', value: network === 'testnet' ? 'Story Aeneid Testnet' : 'Story Mainnet' },
        { trait_type: 'Generated', value: new Date().toISOString() },
        { trait_type: 'License', value: license },
        { trait_type: 'Keywords', value: keywords.join(', ') },
        { trait_type: 'PDF', value: pdfIpfsHash ? `ipfs://${pdfIpfsHash}` : 'N/A' },
      ],
    };

    // Create NFT metadata (ERC-721 standard)
    const nftMetadata = {
      name: `Krump Journal: ${title}`,
      description: abstract,
      image: coverImageUri,
      external_url: scanUrl,
      attributes: [
        { trait_type: 'DOI', value: doi },
        { trait_type: 'Publication Type', value: publicationType },
        { trait_type: 'Author', value: authorName },
        { trait_type: 'ORCID', value: orcidId },
        { trait_type: 'License', value: license },
        { trait_type: 'Keywords', value: keywords.join(', ') },
        { trait_type: 'Published', value: new Date().toISOString() },
      ],
    };

    // Helper function to compute SHA-256 hash
    async function computeHash(metadata: any): Promise<string> {
      const metadataString = JSON.stringify(metadata);
      const encoder = new TextEncoder();
      const data = encoder.encode(metadataString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Compute hashes
    const ipaMetadataHash = await computeHash(ipaMetadata);
    const nftMetadataHash = await computeHash(nftMetadata);

    console.log('IPA Metadata Hash:', ipaMetadataHash);
    console.log('NFT Metadata Hash:', nftMetadataHash);

    // Upload IPA metadata to IPFS
    const ipaUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: ipaMetadata,
        pinataMetadata: {
          name: `${title}-ipa-metadata.json`,
        },
      }),
    });

    if (!ipaUploadResponse.ok) {
      const errorText = await ipaUploadResponse.text();
      console.error('IPA metadata upload error:', errorText);
      throw new Error(`Failed to upload IPA metadata: ${ipaUploadResponse.status}`);
    }

    const ipaResult = await ipaUploadResponse.json();
    const ipaMetadataUri = `ipfs://${ipaResult.IpfsHash}`;
    console.log('IPA Metadata uploaded:', ipaMetadataUri);

    // Upload NFT metadata to IPFS
    const nftUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: nftMetadata,
        pinataMetadata: {
          name: `${title}-nft-metadata.json`,
        },
      }),
    });

    if (!nftUploadResponse.ok) {
      const errorText = await nftUploadResponse.text();
      console.error('NFT metadata upload error:', errorText);
      throw new Error(`Failed to upload NFT metadata: ${nftUploadResponse.status}`);
    }

    const nftResult = await nftUploadResponse.json();
    const nftMetadataUri = `ipfs://${nftResult.IpfsHash}`;
    console.log('NFT Metadata uploaded:', nftMetadataUri);

    // Upload full article content to IPFS
    const articleContent = {
      title,
      abstract,
      content,
      keywords,
      publicationType,
      license,
      authorName,
      orcidId,
      doi,
      doiUrl,
      coverImage: coverImageUri,
      createdAt: new Date().toISOString(),
    };

    const contentUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: articleContent,
        pinataMetadata: {
          name: `${title}-article.json`,
        },
      }),
    });

    if (!contentUploadResponse.ok) {
      const errorText = await contentUploadResponse.text();
      console.error('Article content upload error:', errorText);
      throw new Error(`Failed to upload article content: ${contentUploadResponse.status}`);
    }

    const contentResult = await contentUploadResponse.json();
    const contentIpfsHash = contentResult.IpfsHash;
    console.log('Article content uploaded:', contentIpfsHash);

    return new Response(
      JSON.stringify({
        ipaMetadataUri,
        ipaMetadataHash,
        nftMetadataUri,
        nftMetadataHash,
        contentIpfsHash,
        contentGatewayUrl: `https://gateway.pinata.cloud/ipfs/${contentIpfsHash}`,
        coverImageUri,
        doi,
        doiUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in upload-article-metadata:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
