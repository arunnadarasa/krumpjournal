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
    const { title, authors, orcidId, abstract, content, keywords, license } = await req.json();
    
    // Build professional SVG with academic styling and embedded HTML content
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xhtml="http://www.w3.org/1999/xhtml"
     width="816" height="1056" viewBox="0 0 816 1056">
  <defs>
    <style type="text/css">
      .journal-name {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 2px;
        fill: #666;
      }
      .title-text {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 28px;
        font-weight: bold;
        fill: #1a1a1a;
      }
      .authors-text {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 16px;
        fill: #555;
      }
      .orcid-text {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 12px;
        fill: #666;
      }
      .html-content {
        font-family: Georgia, 'Times New Roman', serif;
        line-height: 1.8;
        color: #1a1a1a;
        padding: 20px;
      }
      .html-content h1, .html-content h2, .html-content h3 {
        font-variant: small-caps;
        border-bottom: 1px solid #ccc;
        padding-bottom: 0.25rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
      }
      .html-content h1 { font-size: 22px; }
      .html-content h2 { font-size: 18px; }
      .html-content h3 { font-size: 16px; }
      .html-content p {
        margin-bottom: 1rem;
        text-align: justify;
      }
      .html-content ul, .html-content ol {
        margin: 1rem 0;
        padding-left: 2rem;
      }
      .html-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
      }
      .html-content table th, .html-content table td {
        border: 1px solid #ddd;
        padding: 0.5rem;
        text-align: left;
      }
      .html-content table th {
        background: #f5f5f5;
        font-weight: bold;
      }
      .html-content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1.5rem auto;
      }
      .abstract-section {
        font-style: italic;
        padding: 1.25rem;
        background: #f9f9f9;
        font-size: 14px;
      }
      .abstract-title {
        font-weight: bold;
        font-style: normal;
        margin-bottom: 0.5rem;
      }
      .keywords-section {
        font-size: 14px;
        margin: 1rem 0;
      }
      .footer-text {
        font-size: 12px;
        fill: #666;
      }
    </style>
  </defs>
  
  <!-- White background -->
  <rect width="816" height="1056" fill="white"/>
  
  <!-- Header border -->
  <line x1="40" y1="110" x2="776" y2="110" stroke="#333" stroke-width="2"/>
  
  <!-- Journal name -->
  <text x="408" y="40" text-anchor="middle" class="journal-name">KRUMP JOURNAL</text>
  
  <!-- Title -->
  <text x="408" y="70" text-anchor="middle" class="title-text">${title || 'Untitled Article'}</text>
  
  <!-- Authors -->
  <text x="408" y="95" text-anchor="middle" class="authors-text">${authors || 'Anonymous'}</text>
  ${orcidId ? `<text x="408" y="108" text-anchor="middle" class="orcid-text">ORCID: ${orcidId}</text>` : ''}
  
  <!-- Abstract border -->
  ${abstract ? `<rect x="40" y="140" width="736" height="auto" fill="#f9f9f9" stroke="none"/>
  <line x1="40" y1="140" x2="40" y2="220" stroke="#333" stroke-width="4"/>` : ''}
  
  <!-- Keywords and Abstract section using foreignObject for HTML content -->
  <foreignObject x="40" y="${abstract ? '130' : '120'}" width="736" height="200">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Georgia, 'Times New Roman', serif;">
      ${keywords && keywords.length > 0 ? `
      <div class="keywords-section">
        <strong>Keywords:</strong> ${keywords.join(', ')}
      </div>
      ` : ''}
      ${abstract ? `
      <div class="abstract-section">
        <div class="abstract-title">Abstract</div>
        <div>${abstract}</div>
      </div>
      ` : ''}
    </div>
  </foreignObject>
  
  <!-- Main content using foreignObject for rich HTML -->
  <foreignObject x="40" y="340" width="736" height="650">
    <div xmlns="http://www.w3.org/1999/xhtml" class="html-content">
      ${content || '<p>No content provided.</p>'}
    </div>
  </foreignObject>
  
  <!-- Footer -->
  <line x1="40" y1="1010" x2="776" y2="1010" stroke="#ccc" stroke-width="1"/>
  <text x="408" y="1030" text-anchor="middle" class="footer-text">© ${new Date().getFullYear()} Krump Journal. All rights reserved.</text>
  ${license ? `<text x="408" y="1045" text-anchor="middle" class="footer-text">Licensed under ${license}</text>` : ''}
</svg>`.trim();

    const PINATA_JWT = Deno.env.get('PINATA_JWT');
    if (!PINATA_JWT) {
      throw new Error('PINATA_JWT not configured');
    }

    // Upload SVG to IPFS
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const formData = new FormData();
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_');
    formData.append('file', blob, `${sanitizedTitle}.svg`);

    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!pinataResponse.ok) {
      throw new Error(`Pinata upload failed: ${await pinataResponse.text()}`);
    }

    const pinataData = await pinataResponse.json();
    const pdfIpfsHash = pinataData.IpfsHash;
    const pdfGatewayUrl = `https://gateway.pinata.cloud/ipfs/${pdfIpfsHash}`;

    return new Response(
      JSON.stringify({
        pdfIpfsHash,
        pdfGatewayUrl,
        message: 'PDF generated and uploaded to IPFS',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('PDF generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
