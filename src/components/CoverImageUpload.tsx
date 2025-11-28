import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CoverImageUploadProps {
  onImageSelect: (file: File | null, preview: string | null) => void;
  disabled?: boolean;
}

export const CoverImageUpload = ({ onImageSelect, disabled }: CoverImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WEBP image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelect(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cover-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt: 'scientific research article, abstract visualization, modern academic design'
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const { imageUrl } = await response.json();
      
      // Convert base64 to File object
      const base64Response = await fetch(imageUrl);
      const blob = await base64Response.blob();
      const file = new File([blob], 'ai-generated-cover.png', { type: 'image/png' });
      
      setPreview(imageUrl);
      onImageSelect(file, imageUrl);
      toast.success('Cover image generated successfully!');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Cover Image</Label>
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Cover preview"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={disabled}
              className="hidden"
              id="cover-image-upload"
            />
            <label htmlFor="cover-image-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Click to upload cover image</p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WEBP (max 5MB)
              </p>
            </label>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateClick}
            disabled={disabled || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate with AI'
            )}
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        A cover image helps your article stand out and will be included in the NFT metadata.
      </p>
    </div>
  );
};
