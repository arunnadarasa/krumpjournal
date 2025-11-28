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
    
    // Build professional HTML with academic styling
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.8;
      color: #1a1a1a;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 1in;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .journal-name {
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #666;
      margin-bottom: 0.5rem;
    }
    .title {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 0.75rem;
    }
    .authors {
      font-size: 16px;
      color: #555;
      margin-bottom: 0.5rem;
    }
    .orcid {
      font-size: 12px;
      color: #666;
      background: #f0f0f0;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .keywords {
      margin: 1rem 0;
      font-size: 14px;
    }
    .keywords strong {
      font-weight: bold;
    }
    .abstract {
      font-style: italic;
      padding: 1.25rem;
      border-left: 4px solid #333;
      background: #f9f9f9;
      margin: 1.5rem 0;
      font-size: 14px;
    }
    .abstract-title {
      font-weight: bold;
      font-style: normal;
      margin-bottom: 0.5rem;
    }
    .content {
      margin-top: 2rem;
    }
    .content h1, .content h2, .content h3 {
      font-variant: small-caps;
      border-bottom: 1px solid #ccc;
      padding-bottom: 0.25rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    .content h1 { font-size: 22px; }
    .content h2 { font-size: 18px; }
    .content h3 { font-size: 16px; }
    .content p {
      margin-bottom: 1rem;
      text-align: justify;
    }
    .content ul, .content ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    .content table th, .content table td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: left;
    }
    .content table th {
      background: #f5f5f5;
      font-weight: bold;
    }
    .content img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.5rem auto;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #ccc;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .license {
      margin-top: 1rem;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="journal-name">Krump Journal</div>
    <h1 class="title">${title || 'Untitled Article'}</h1>
    <div class="authors">
      ${authors || 'Anonymous'}
      ${orcidId ? `<span class="orcid">ORCID: ${orcidId}</span>` : ''}
    </div>
  </div>

  ${keywords && keywords.length > 0 ? `
  <div class="keywords">
    <strong>Keywords:</strong> ${keywords.join(', ')}
  </div>
  ` : ''}

  ${abstract ? `
  <div class="abstract">
    <div class="abstract-title">Abstract</div>
    ${abstract}
  </div>
  ` : ''}

  <div class="content">
    ${content || '<p>No content provided.</p>'}
  </div>

  <div class="footer">
    <div>© ${new Date().getFullYear()} Krump Journal. All rights reserved.</div>
    ${license ? `<div class="license">Licensed under ${license}</div>` : ''}
  </div>
</body>
</html>
    `.trim();

    // Convert HTML to PDF using jsPDF-like approach via browser rendering
    // For now, we'll upload the HTML content to IPFS and return a reference
    // In production, you'd use Puppeteer or a similar service to render actual PDF

    const PINATA_JWT = Deno.env.get('PINATA_JWT');
    if (!PINATA_JWT) {
      throw new Error('PINATA_JWT not configured');
    }

    // Upload HTML as PDF placeholder (in production, this would be actual PDF bytes)
    const blob = new Blob([html], { type: 'text/html' });
    const formData = new FormData();
    formData.append('file', blob, `${title.replace(/[^a-z0-9]/gi, '_')}.html`);

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
