import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Zap, Download, Eye, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { pipeline } from '@huggingface/transformers';

// Image preprocessing utilities
const preprocessImage = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Enhance contrast and reduce noise
  for (let i = 0; i < data.length; i += 4) {
    // Contrast enhancement
    const r = ((data[i] / 255 - 0.5) * 1.5 + 0.5) * 255;
    const g = ((data[i + 1] / 255 - 0.5) * 1.5 + 0.5) * 255;
    const b = ((data[i + 2] / 255 - 0.5) * 1.5 + 0.5) * 255;
    
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9);
};

const createEnsembleClassification = (results: any[]) => {
  const labelCounts = new Map();
  const confidenceSum = new Map();
  
  results.forEach(result => {
    if (result && Array.isArray(result) && result.length > 0) {
      const topResult = result[0] as { label: string; score: number };
      const label = topResult.label;
      
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
      confidenceSum.set(label, (confidenceSum.get(label) || 0) + topResult.score);
    }
  });
  
  // Find most frequent label with highest average confidence
  let bestLabel = '';
  let bestScore = 0;
  let bestCount = 0;
  
  labelCounts.forEach((count, label) => {
    const avgScore = confidenceSum.get(label) / count;
    if (count > bestCount || (count === bestCount && avgScore > bestScore)) {
      bestLabel = label;
      bestScore = avgScore;
      bestCount = count;
    }
  });
  
  // Boost confidence if multiple models agree
  const confidenceBoost = bestCount > 1 ? Math.min(0.2, (bestCount - 1) * 0.1) : 0;
  return {
    label: bestLabel,
    confidence: Math.min(1.0, bestScore + confidenceBoost),
    agreementCount: bestCount
  };
};

interface ProcessedImage {
  file: File;
  preview: string;
  classification?: {
    label: string;
    confidence: number;
    agreementCount?: number;
    rawResults?: any[];
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
        title: "Initializing AI ensemble",
        description: "Loading multiple specialized models for higher accuracy...",
      });

      // Initialize multiple models for ensemble classification
      const models = [
        { name: 'ViT Base', id: 'Xenova/vit-base-patch16-224' },
        { name: 'ResNet', id: 'Xenova/resnet-50' },
        { name: 'EfficientNet', id: 'Xenova/efficientnet-b0' }
      ];

      const classifiers = [];
      for (const model of models) {
        try {
          const classifier = await pipeline(
            'image-classification',
            model.id,
            { device: 'webgpu' }
          );
          classifiers.push({ classifier, name: model.name });
        } catch (error) {
          console.warn(`Failed to load ${model.name}, continuing with others...`);
        }
      }

      if (classifiers.length === 0) {
        throw new Error('No models could be loaded');
      }

      toast({
        title: `Loaded ${classifiers.length} models`,
        description: "Processing with ensemble classification for higher confidence...",
      });

      const processed: ProcessedImage[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        
        // Create preview URL
        const preview = URL.createObjectURL(file);
        
        // Preprocess image for better results
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = preview;
        });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 224;
        canvas.height = 224;
        ctx.drawImage(img, 0, 0, 224, 224);
        
        const enhancedImageUrl = preprocessImage(canvas, ctx);
        
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
          // Run classification with all available models
          const results = [];
          for (const { classifier, name } of classifiers) {
            try {
              const result = await classifier(enhancedImageUrl);
              results.push(result);
            } catch (error) {
              console.warn(`${name} classification failed:`, error);
            }
          }
          
          if (results.length > 0) {
            const ensembleResult = createEnsembleClassification(results);
            
            // Only show results with decent confidence
            if (ensembleResult.confidence > 0.1) {
              processedItem.classification = {
                label: ensembleResult.label,
                confidence: ensembleResult.confidence,
                agreementCount: ensembleResult.agreementCount,
                rawResults: results
              };
            }
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
      
      const successCount = processed.filter(p => p.classification).length;
      toast({
        title: "Ensemble processing complete",
        description: `Successfully classified ${successCount}/${processed.length} images with enhanced confidence`,
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
                  
                  <div className="space-y-1">
                    {item.processing ? (
                      <Badge variant="secondary">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Processing...
                      </Badge>
                    ) : item.classification ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            item.classification.confidence > 0.7 ? 'bg-gradient-cosmic' :
                            item.classification.confidence > 0.4 ? 'bg-secondary' : 'bg-muted'
                          } text-primary-foreground`}>
                            {item.classification.label}
                          </Badge>
                          {item.classification.agreementCount && item.classification.agreementCount > 1 && (
                            <Badge variant="outline" className="text-xs">
                              {item.classification.agreementCount} models agree
                            </Badge>
                          )}
                        </div>
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