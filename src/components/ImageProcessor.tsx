import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Zap, Download, Eye, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { pipeline } from '@huggingface/transformers';

interface ProcessedImage {
  file: File;
  preview: string;
  classification?: {
    label: string;
    confidence: number;
  };
  processed?: boolean;
  processing?: boolean;
}

interface ImageProcessorProps {
  images: File[];
  processedImages: ProcessedImage[];
  setProcessedImages: (images: ProcessedImage[]) => void;
}

export const ImageProcessor: React.FC<ImageProcessorProps> = ({ 
  images, 
  processedImages, 
  setProcessedImages 
}) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processImages = async () => {
    setProcessing(true);
    setProgress(0);
    
    try {
      toast({
        title: "Initializing AI models",
        description: "Loading computer vision models...",
      });

      // Initialize the image classification pipeline
      const classifier = await pipeline(
        'image-classification',
        'microsoft/resnet-50',
        { device: 'webgpu' }
      );

      const processed: ProcessedImage[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        
        // Create preview URL
        const preview = URL.createObjectURL(file);
        
        // Add to processed array with processing state
        const processedItem: ProcessedImage = {
          file,
          preview,
          processing: true,
        };
        processed.push(processedItem);
        
        // Update progress
        setProgress(((i + 1) / images.length) * 100);
        
        try {
          // Classify the image
          const result = await classifier(preview);
          
          if (result && Array.isArray(result) && result.length > 0) {
            const topResult = result[0] as { label: string; score: number };
            processedItem.classification = {
              label: topResult.label,
              confidence: topResult.score,
            };
          }
          
          processedItem.processed = true;
          processedItem.processing = false;
          
        } catch (error) {
          console.error(`Error processing image ${file.name}:`, error);
          processedItem.processing = false;
          processedItem.processed = false;
        }
      }
      
      setProcessedImages(processed);
      
      toast({
        title: "Processing complete",
        description: `Successfully processed ${processed.length} images`,
      });
      
    } catch (error) {
      console.error('Error initializing models:', error);
      toast({
        title: "Processing failed",
        description: "Unable to initialize AI models. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const exportResults = () => {
    const csvData = processedImages
      .filter(img => img.classification)
      .map(img => ({
        filename: img.file.name,
        classification: img.classification!.label,
        confidence: img.classification!.confidence.toFixed(4),
        size: img.file.size,
      }));

    const csvContent = [
      ['filename', 'classification', 'confidence', 'file_size'],
      ...csvData.map(row => [row.filename, row.classification, row.confidence, row.size])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'astronomical_classifications.csv';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Classifications exported to CSV file",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5 text-primary" />
            AI Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ready to process {images.length} astronomical image(s) using advanced computer vision models.
          </p>
          
          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Processing images...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={processImages}
              disabled={processing || images.length === 0}
              className="bg-gradient-cosmic hover:shadow-cosmic transition-all duration-300"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Start Processing
                </>
              )}
            </Button>
            
            {processedImages.length > 0 && (
              <Button 
                variant="secondary" 
                onClick={exportResults}
                className="hover:shadow-nebula transition-all duration-300"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {processedImages.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Eye className="h-5 w-5 text-accent" />
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {processedImages.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex-shrink-0">
                    <img 
                      src={item.preview} 
                      alt={item.file.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-grow space-y-1">
                    <p className="font-medium text-foreground">{item.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 text-right space-y-1">
                    {item.processing ? (
                      <Badge variant="secondary">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Processing...
                      </Badge>
                    ) : item.classification ? (
                      <div className="space-y-1">
                        <Badge className="bg-gradient-cosmic text-primary-foreground">
                          {item.classification.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {(item.classification.confidence * 100).toFixed(1)}% confidence
                        </p>
                      </div>
                    ) : (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};