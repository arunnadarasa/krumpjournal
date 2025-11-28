import { CheckCircle2, Copy, ExternalLink, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface SubmissionSuccessProps {
  title: string;
  authors: string;
  orcidId?: string;
  keywords?: string[];
  ipfsHash: string;
  ipfsGatewayUrl: string;
  pdfIpfsHash?: string;
  pdfGatewayUrl?: string;
  doi: string;
  transactionHash?: string;
  ipAssetId?: string;
  network: string;
}

export const SubmissionSuccess = ({
  title,
  authors,
  orcidId,
  keywords,
  ipfsHash,
  ipfsGatewayUrl,
  pdfIpfsHash,
  pdfGatewayUrl,
  doi,
  transactionHash,
  ipAssetId,
  network,
}: SubmissionSuccessProps) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const zenodoMetadata = `Title: ${title}
Authors: ${authors}${orcidId ? ` (ORCID: ${orcidId})` : ''}
Keywords: ${keywords?.join(', ') || 'N/A'}
DOI: ${doi}
IPFS Gateway URL: ${ipfsGatewayUrl}
PDF IPFS URL: ${pdfGatewayUrl || 'N/A'}
License: CC BY 4.0`;

  const explorerUrl = network === 'mainnet' 
    ? `https://explorer.story.foundation/tx/${transactionHash}`
    : `https://testnet.storyscan.xyz/tx/${transactionHash}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
        <h1 className="text-3xl font-bold">Article Successfully Submitted!</h1>
        <p className="text-muted-foreground">
          Your article has been published to the decentralized web
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Uploaded to IPFS</p>
            <p className="text-sm text-muted-foreground">Content stored on the decentralized network</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Registered on Story Protocol</p>
            <p className="text-sm text-muted-foreground">Intellectual property rights secured on-chain</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">DOI Generated</p>
            <p className="text-sm text-muted-foreground">Permanent identifier: {doi}</p>
          </div>
        </div>
      </Card>

      <Separator />

      <Card className="p-6 space-y-4 bg-accent/10">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Get Your Official DOI</h2>
        </div>
        
        <p className="text-sm text-muted-foreground">
          To make your DOI resolvable and discoverable by the global research community, 
          register with <span className="font-semibold">Zenodo</span> (free for researchers):
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <Badge variant="secondary" className="rounded-full w-6 h-6 flex items-center justify-center">1</Badge>
            <p>Create a free account at <a href="https://zenodo.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">zenodo.org</a></p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="rounded-full w-6 h-6 flex items-center justify-center">2</Badge>
            <p>Upload your PDF or link to the IPFS URL</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="rounded-full w-6 h-6 flex items-center justify-center">3</Badge>
            <p>Fill in metadata (use the "Copy Metadata" button below)</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="rounded-full w-6 h-6 flex items-center justify-center">4</Badge>
            <p>Publish to receive your official Zenodo DOI</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => copyToClipboard(zenodoMetadata, 'Metadata')}
            variant="default"
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Metadata for Zenodo
          </Button>
          <Button
            onClick={() => window.open('https://zenodo.org/deposit/new', '_blank')}
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Zenodo
          </Button>
        </div>
      </Card>

      <Separator />

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold">Your Article Details</h3>
        
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Title</p>
            <p className="font-medium">{title}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Authors</p>
            <p className="font-medium">
              {authors}
              {orcidId && (
                <Badge variant="secondary" className="ml-2">
                  ORCID: {orcidId}
                </Badge>
              )}
            </p>
          </div>

          {keywords && keywords.length > 0 && (
            <div>
              <p className="text-muted-foreground">Keywords</p>
              <p className="font-medium">{keywords.join(', ')}</p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground">IPFS Gateway URL</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                {ipfsGatewayUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(ipfsGatewayUrl, 'IPFS URL')}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(ipfsGatewayUrl, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {pdfGatewayUrl && (
            <div>
              <p className="text-muted-foreground">PDF on IPFS</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                  {pdfGatewayUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(pdfGatewayUrl, 'PDF URL')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(pdfGatewayUrl, '_blank')}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {transactionHash && (
            <div>
              <p className="text-muted-foreground">Story Protocol Transaction</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                  {transactionHash}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(explorerUrl, '_blank')}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {ipAssetId && (
            <div>
              <p className="text-muted-foreground">IP Asset ID</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                {ipAssetId}
              </code>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-2 justify-center">
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Return to Home
        </Button>
        <Button onClick={() => window.location.href = '/submit'} variant="default">
          Submit Another Article
        </Button>
      </div>
    </div>
  );
};
