import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface PDFUploadProps {
  onPDFExtract: (content: string) => void;
  disabled?: boolean;
}

export const PDFUpload = ({ onPDFExtract, disabled }: PDFUploadProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          
          // Call edge function to extract text
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-pdf-text`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ pdfBase64: base64 }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to extract PDF text');
          }

          const { text } = await response.json();
          onPDFExtract(text);
          toast.success('PDF content extracted successfully');
        } catch (error) {
          console.error('PDF extraction error:', error);
          toast.error('Failed to extract text from PDF');
          handleRemove();
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File read error:', error);
      toast.error('Failed to read PDF file');
      setIsProcessing(false);
      handleRemove();
    }
  };

  const handleRemove = () => {
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Upload Overleaf PDF (Optional)</Label>
      
      {fileName ? (
        <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/50">
          <FileText className="h-5 w-5 text-primary" />
          <span className="flex-1 text-sm font-medium truncate">{fileName}</span>
          {!isProcessing && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={disabled || isProcessing}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {isProcessing ? 'Processing PDF...' : 'Click to upload PDF'}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF from Overleaf (max 10MB)
            </p>
          </label>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Upload your Overleaf PDF to automatically extract the article content. The text will be populated in the content field below.
      </p>
    </div>
  );
};
