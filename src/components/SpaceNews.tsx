import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Rocket, Telescope, Globe, Calendar, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  description: string;
  date: string;
  category: 'discovery' | 'mission' | 'technology' | 'research';
  source: string;
  url?: string;
}

const mockSpaceNews: NewsItem[] = [
  {
    title: "James Webb Telescope Discovers Ancient Galaxies",
    description: "JWST has identified galaxies formed just 400 million years after the Big Bang, providing unprecedented insights into early universe formation.",
    date: "2024-09-20",
    category: "discovery",
    source: "NASA",
    url: "https://www.nasa.gov"
  },
  {
    title: "Perseverance Rover Finds Organic Compounds on Mars",
    description: "Latest analysis reveals complex organic molecules in Martian rock samples, suggesting potential for ancient microbial life.",
    date: "2024-09-18",
    category: "discovery",
    source: "JPL",
    url: "https://www.jpl.nasa.gov"
  },
  {
    title: "Artemis III Mission Timeline Updated",
    description: "NASA announces revised schedule for crewed lunar landing mission, with new target date set for late 2025.",
    date: "2024-09-15",
    category: "mission",
    source: "NASA",
    url: "https://www.nasa.gov"
  },
  {
    title: "Euclid Space Telescope Maps Dark Matter",
    description: "ESA's Euclid mission releases first detailed maps of dark matter distribution across the observable universe.",
    date: "2024-09-12",
    category: "research",
    source: "ESA",
    url: "https://www.esa.int"
  },
  {
    title: "SpaceX Achieves New Reusability Milestone",
    description: "Falcon 9 booster completes record-breaking 20th flight, advancing sustainable space transportation technology.",
    date: "2024-09-10",
    category: "technology",
    source: "SpaceX",
    url: "https://www.spacex.com"
  },
  {
    title: "Hubble Observes Stellar Nursery Formation",
    description: "New observations reveal the dynamic process of star formation in the Eagle Nebula with unprecedented detail.",
    date: "2024-09-08",
    category: "discovery",
    source: "STScI",
    url: "https://hubblesite.org"
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'discovery': return <Telescope className="h-4 w-4" />;
    case 'mission': return <Rocket className="h-4 w-4" />;
    case 'technology': return <Globe className="h-4 w-4" />;
    case 'research': return <Calendar className="h-4 w-4" />;
    default: return <Telescope className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'discovery': return 'bg-gradient-cosmic text-primary-foreground';
    case 'mission': return 'bg-accent text-accent-foreground';
    case 'technology': return 'bg-secondary text-secondary-foreground';
    case 'research': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const SpaceNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading news
    setTimeout(() => {
      setNews(mockSpaceNews);
      setLoading(false);
    }, 1000);
  }, []);

  const refreshNews = () => {
    setLoading(true);
    toast({
      title: "Refreshing space news",
      description: "Fetching latest updates from space agencies...",
    });
    
    // Simulate refresh
    setTimeout(() => {
      setNews([...mockSpaceNews].sort(() => Math.random() - 0.5));
      setLoading(false);
      toast({
        title: "News updated",
        description: "Latest space activities and discoveries loaded",
      });
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Rocket className="h-5 w-5 text-primary" />
            Latest Space Activities & Discoveries
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshNews}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-muted-foreground">
          Stay updated with recent space missions, discoveries, and technological advances
        </p>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:shadow-cosmic transition-all duration-300 bg-background/20">
                  <div className="flex-shrink-0 mt-1">
                    <Badge className={getCategoryColor(item.category)}>
                      {getCategoryIcon(item.category)}
                      <span className="ml-1 capitalize">{item.category}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex-grow space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      {item.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.date)}
                      </span>
                      <span>{item.source}</span>
                    </div>
                  </div>
                </div>
                
                {index < news.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};