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
    const { pdfBase64 } = await req.json();
    
    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: 'PDF data is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Extracting text from PDF");

    // Remove data URL prefix if present
    const base64Data = pdfBase64.includes('base64,') 
      ? pdfBase64.split('base64,')[1] 
      : pdfBase64;

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Use pdf-lib to extract text (basic extraction)
    // Note: For production, you might want to use a more robust solution
    const decoder = new TextDecoder('utf-8');
    let text = '';
    
    try {
      // Simple text extraction from PDF bytes
      // This is a basic implementation - for production use a proper PDF parser
      const pdfText = decoder.decode(bytes);
      
      // Extract text between stream and endstream markers
      const streamMatches = pdfText.matchAll(/stream\s+([\s\S]*?)\s+endstream/g);
      for (const match of streamMatches) {
        const content = match[1];
        // Try to extract readable text
        const readableText = content.replace(/[^\x20-\x7E\n]/g, ' ').trim();
        if (readableText.length > 10) {
          text += readableText + '\n';
        }
      }

      // If no text found, try to extract from text objects
      if (text.length < 100) {
        const textMatches = pdfText.matchAll(/\((.*?)\)/g);
        for (const match of textMatches) {
          const content = match[1];
          if (content.length > 5 && /[a-zA-Z]/.test(content)) {
            text += content + ' ';
          }
        }
      }
    } catch (error) {
      console.error("Error parsing PDF:", error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to extract text from PDF. Please ensure the PDF is not encrypted or corrupted.',
          text: ''
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Clean up the text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s+\n/g, '\n\n')
      .trim();

    if (text.length < 50) {
      return new Response(
        JSON.stringify({ 
          text: '',
          warning: 'Could not extract sufficient text from PDF. The PDF may be image-based or encrypted. Please copy and paste your content manually.'
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Extracted ${text.length} characters from PDF`);

    return new Response(
      JSON.stringify({ text }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in extract-pdf-text:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        text: ''
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
