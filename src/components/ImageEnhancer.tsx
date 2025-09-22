import React, { useRef, useEffect, useState } from "react";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Stars, Sparkles, Contrast, Download, RefreshCw, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageEnhancerProps {
  imageFile: File;
  onClose: () => void;
}

export const ImageEnhancer: React.FC<ImageEnhancerProps> = ({ imageFile, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  
  // Enhancement parameters
  const [brightness, setBrightness] = useState([0]);
  const [contrast, setContrast] = useState([0]);
  const [starEnhancement, setStarEnhancement] = useState([0]);
  const [noiseReduction, setNoiseReduction] = useState([0]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 600,
      backgroundColor: "#000000",
    });

    setFabricCanvas(canvas);
    
    // Load the uploaded image
    loadImageToCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [imageFile]);

  const loadImageToCanvas = async (canvas: FabricCanvas) => {
    const img = new Image();
    img.onload = () => {
      // Calculate dimensions to fit canvas while maintaining aspect ratio
      const maxSize = 600;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      // Create a temporary canvas to get image data
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = width;
      tempCanvas.height = height;
      tempCtx.drawImage(img, 0, 0, width, height);
      
      // Store original image data
      const imageData = tempCtx.getImageData(0, 0, width, height);
      setOriginalImageData(imageData);
      
      // Set canvas size and add image
      canvas.setDimensions({ width, height });
      
      FabricImage.fromURL(tempCanvas.toDataURL()).then((fabricImg) => {
        canvas.backgroundImage = fabricImg;
        canvas.renderAll();
      });
    };
    
    img.src = URL.createObjectURL(imageFile);
  };

  const enhanceStars = (imageData: ImageData, intensity: number): ImageData => {
    const data = new Uint8ClampedArray(imageData.data);
    const threshold = 180; // Brightness threshold for star detection
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate luminance
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // If pixel is bright enough to be a star, enhance it
      if (luminance > threshold) {
        const enhanceFactor = 1 + (intensity / 100) * 2;
        data[i] = Math.min(255, r * enhanceFactor);
        data[i + 1] = Math.min(255, g * enhanceFactor);
        data[i + 2] = Math.min(255, b * enhanceFactor);
      }
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  };

  const adjustBrightnessContrast = (imageData: ImageData, brightness: number, contrast: number): ImageData => {
    const data = new Uint8ClampedArray(imageData.data);
    const brightnessFactor = brightness / 100 * 255;
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness
      data[i] = Math.max(0, Math.min(255, data[i] + brightnessFactor));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightnessFactor));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightnessFactor));
      
      // Apply contrast
      data[i] = Math.max(0, Math.min(255, contrastFactor * (data[i] - 128) + 128));
      data[i + 1] = Math.max(0, Math.min(255, contrastFactor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.max(0, Math.min(255, contrastFactor * (data[i + 2] - 128) + 128));
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  };

  const applyNoiseReduction = (imageData: ImageData, intensity: number): ImageData => {
    if (intensity === 0) return imageData;
    
    const data = new Uint8ClampedArray(imageData.data);
    const { width, height } = imageData;
    
    // Simple blur for noise reduction
    const blurRadius = Math.floor(intensity / 25) + 1;
    
    for (let y = blurRadius; y < height - blurRadius; y++) {
      for (let x = blurRadius; x < width - blurRadius; x++) {
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
          for (let dx = -blurRadius; dx <= blurRadius; dx++) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        
        const i = (y * width + x) * 4;
        data[i] = r / count;
        data[i + 1] = g / count;
        data[i + 2] = b / count;
      }
    }
    
    return new ImageData(data, imageData.width, imageData.height);
  };

  const applyEnhancements = () => {
    if (!originalImageData || !fabricCanvas) return;
    
    let enhanced = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height
    );
    
    // Apply enhancements in order
    enhanced = adjustBrightnessContrast(enhanced, brightness[0], contrast[0]);
    enhanced = enhanceStars(enhanced, starEnhancement[0]);
    enhanced = applyNoiseReduction(enhanced, noiseReduction[0]);
    
    // Create canvas from enhanced data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = enhanced.width;
    tempCanvas.height = enhanced.height;
    tempCtx.putImageData(enhanced, 0, 0);
    
    // Update fabric canvas
    FabricImage.fromURL(tempCanvas.toDataURL()).then((fabricImg) => {
      fabricCanvas.backgroundImage = fabricImg;
      fabricCanvas.renderAll();
    });
  };

  useEffect(() => {
    applyEnhancements();
  }, [brightness, contrast, starEnhancement, noiseReduction]);

  const downloadEnhanced = () => {
    if (!fabricCanvas) return;
    
    const link = document.createElement('a');
    link.download = `enhanced_${imageFile.name}`;
    link.href = fabricCanvas.toDataURL({ multiplier: 1, format: 'png' });
    link.click();
    
    toast({
      title: "Image downloaded",
      description: "Enhanced astronomical image saved successfully",
    });
  };

  const resetEnhancements = () => {
    setBrightness([0]);
    setContrast([0]);
    setStarEnhancement([0]);
    setNoiseReduction([0]);
  };

  const applyAutoEnhance = () => {
    setBrightness([25]);
    setContrast([30]);
    setStarEnhancement([40]);
    setNoiseReduction([20]);
    
    toast({
      title: "Auto-enhancement applied",
      description: "Optimal settings for astronomical images",
    });
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Stars className="h-5 w-5 text-primary" />
          Astronomical Image Enhancement
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enhance faded stars and improve image quality for better classification
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Canvas */}
          <div className="space-y-4">
            <div className="border border-border/50 rounded-lg overflow-hidden bg-background/20">
              <canvas ref={canvasRef} className="max-w-full block" />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={downloadEnhanced} className="bg-gradient-cosmic hover:shadow-cosmic">
                <Download className="mr-2 h-4 w-4" />
                Download Enhanced
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
          
          {/* Controls */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button 
                onClick={applyAutoEnhance}
                className="bg-gradient-cosmic hover:shadow-cosmic flex-1"
              >
                <Zap className="mr-2 h-4 w-4" />
                Auto Enhance
              </Button>
              <Button variant="outline" onClick={resetEnhancements}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="font-medium text-foreground">Star Enhancement</span>
                  <Badge variant="outline">{starEnhancement[0]}%</Badge>
                </div>
                <Slider
                  value={starEnhancement}
                  onValueChange={setStarEnhancement}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Brightens faded stars and celestial objects
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Contrast className="h-4 w-4 text-accent" />
                  <span className="font-medium text-foreground">Brightness</span>
                  <Badge variant="outline">{brightness[0] > 0 ? '+' : ''}{brightness[0]}%</Badge>
                </div>
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  min={-50}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-foreground">Contrast</span>
                  <Badge variant="outline">{contrast[0] > 0 ? '+' : ''}{contrast[0]}%</Badge>
                </div>
                <Slider
                  value={contrast}
                  onValueChange={setContrast}
                  min={-50}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-foreground">Noise Reduction</span>
                  <Badge variant="outline">{noiseReduction[0]}%</Badge>
                </div>
                <Slider
                  value={noiseReduction}
                  onValueChange={setNoiseReduction}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Reduces background noise and artifacts
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};