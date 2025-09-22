import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download } from "lucide-react";

const sampleImages = [
  {
    src: "/sample-images/galaxy-1.jpg",
    name: "Spiral Galaxy",
    description: "Classic spiral structure with visible arms",
    classification: "Spiral Galaxy",
    confidence: 92.5,
  },
  {
    src: "/sample-images/galaxy-2.jpg", 
    name: "Elliptical System",
    description: "Elliptical galaxy with stellar halo",
    classification: "Elliptical Galaxy",
    confidence: 88.7,
  },
  {
    src: "/sample-images/galaxy-3.jpg",
    name: "Binary System",
    description: "Two interacting galactic objects",
    classification: "Interacting Galaxies",
    confidence: 85.3,
  },
];

export const SampleGallery = () => {
  const downloadSample = (imageSrc: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.click();
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Sample Classifications
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore examples of astronomical objects processed by our AI system
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {sampleImages.map((image, index) => (
            <Card 
              key={index}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-cosmic transition-all duration-500 group"
            >
              <CardHeader className="p-0">
                <div className="aspect-square overflow-hidden rounded-t-lg relative">
                  <img 
                    src={image.src}
                    alt={image.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => downloadSample(image.src, image.name)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <div>
                  <CardTitle className="text-foreground mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-accent" />
                    {image.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {image.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Badge className="bg-gradient-cosmic text-primary-foreground">
                    {image.classification}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {image.confidence}% confidence
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};