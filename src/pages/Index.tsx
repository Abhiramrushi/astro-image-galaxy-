import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUploader } from "@/components/ImageUploader";
import { ImageProcessor } from "@/components/ImageProcessor";
import { SampleGallery } from "@/components/SampleGallery";
import { StarField } from "@/components/StarField";
import { Upload, Zap, Star, Download } from "lucide-react";
import cosmicHero from "@/assets/cosmic-hero.jpg";

const Index = () => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [processedImages, setProcessedImages] = useState<any[]>([]);

  return (
    <div className="min-h-screen cosmic-bg">
      <StarField />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${cosmicHero})` }}
        />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-cosmic bg-clip-text text-transparent animate-pulse-glow">
              Cosmic Vision AI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Advanced astronomical image classification powered by AI. Upload galaxy images, 
              reduce noise, and discover celestial classifications with cutting-edge neural networks.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-cosmic hover:shadow-cosmic transition-all duration-300 animate-float"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Upload className="mr-2 h-5 w-5" />
                Start Classification
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                className="hover:shadow-nebula transition-all duration-300"
                onClick={() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Star className="mr-2 h-5 w-5" />
                View Gallery
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our classification system uses state-of-the-art computer vision models 
              to analyze and categorize astronomical objects with high precision.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-cosmic transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-cosmic rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Smart Upload</h3>
                <p className="text-muted-foreground">
                  Drag & drop astronomical images with automatic format detection and preprocessing
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-cosmic transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-cosmic rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">AI Processing</h3>
                <p className="text-muted-foreground">
                  Advanced noise reduction and enhancement using transformer-based models
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-cosmic transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-cosmic rounded-full flex items-center justify-center">
                  <Download className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Export Results</h3>
                <p className="text-muted-foreground">
                  Download classifications as CSV files compatible with research datasets
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Upload Your Images
              </h2>
              <p className="text-muted-foreground text-lg">
                Start by uploading your astronomical images for AI-powered classification
              </p>
            </div>
            
            <ImageUploader 
              images={uploadedImages}
              setImages={setUploadedImages}
            />
            
            {uploadedImages.length > 0 && (
              <div className="mt-12">
                <ImageProcessor 
                  images={uploadedImages}
                  processedImages={processedImages}
                  setProcessedImages={setProcessedImages}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sample Gallery */}
      <section id="gallery-section">
        <SampleGallery />
      </section>
    </div>
  );
};

export default Index;