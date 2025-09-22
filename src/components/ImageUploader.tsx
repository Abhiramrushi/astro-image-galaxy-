import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  images: File[];
  setImages: (images: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, setImages }) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== acceptedFiles.length) {
      toast({
        title: "Invalid files detected",
        description: "Only image files are allowed",
        variant: "destructive",
      });
    }

    const newImages = [...images, ...imageFiles];
    setImages(newImages);

    // Create previews
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    toast({
      title: "Images uploaded",
      description: `${imageFiles.length} image(s) ready for processing`,
    });
  }, [images, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-6">
      <Card 
        {...getRootProps()}
        className={`
          border-2 border-dashed cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-primary bg-primary/5 shadow-cosmic' : 'border-border hover:border-primary/50'}
          bg-card/30 backdrop-blur-sm
        `}
      >
        <CardContent className="p-12 text-center">
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-cosmic rounded-full flex items-center justify-center">
              <Upload className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isDragActive ? 'Drop images here' : 'Upload Astronomical Images'}
              </h3>
              <p className="text-muted-foreground">
                Drag & drop your galaxy images or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports JPG, PNG, WebP formats
              </p>
            </div>
            {!isDragActive && (
              <Button variant="secondary">
                <ImageIcon className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Uploaded Images ({images.length})
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setImages([]);
                setPreviews([]);
              }}
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <Card key={index} className="relative group bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-2">
                  <div className="aspect-square relative rounded-lg overflow-hidden">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {images[index]?.name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {(images[index]?.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};