import { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { ArrowUpRight, ArrowDownRight, Zap, TrendingUp, Award, Users, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

// Statistics carousel that automatically rotates between different sports stats
export function StatsCarousel() {
  // Auto-rotate settings
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Fetch sports stats data
  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock stats data - these would come from your real API in production
  const statsData = [
    {
      title: "NFL Leaders",
      stats: [
        { name: "Patrick Mahomes", team: "KC", stat: "32 TD", category: "Passing TDs", trend: "up" },
        { name: "Derrick Henry", team: "BAL", stat: "1,435 YDS", category: "Rushing Yards", trend: "up" },
        { name: "Justin Jefferson", team: "MIN", stat: "1,300 YDS", category: "Receiving Yards", trend: "up" },
        { name: "T.J. Watt", team: "PIT", stat: "14.5", category: "Sacks", trend: "up" }
      ],
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      color: "bg-gradient-to-r from-red-500/10 to-blue-500/10",
      badgeColor: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "NBA Stats Leaders",
      stats: [
        { name: "Luka Dončić", team: "DAL", stat: "33.2 PPG", category: "Points", trend: "up" },
        { name: "Domantas Sabonis", team: "SAC", stat: "13.8 RPG", category: "Rebounds", trend: "up" },
        { name: "Tyrese Haliburton", team: "IND", stat: "11.3 APG", category: "Assists", trend: "up" },
        { name: "Rudy Gobert", team: "MIN", stat: "2.2 BPG", category: "Blocks", trend: "down" }
      ],
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
      color: "bg-gradient-to-r from-orange-500/10 to-purple-500/10",
      badgeColor: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "MLB Top Performers",
      stats: [
        { name: "Shohei Ohtani", team: "LAD", stat: ".302", category: "Batting Avg", trend: "up" },
        { name: "Aaron Judge", team: "NYY", stat: "42", category: "Home Runs", trend: "up" },
        { name: "Corbin Burnes", team: "BAL", stat: "2.69", category: "ERA", trend: "down" },
        { name: "Gerrit Cole", team: "NYY", stat: "246", category: "Strikeouts", trend: "up" }
      ],
      icon: <Award className="h-5 w-5 text-blue-500" />,
      color: "bg-gradient-to-r from-blue-500/10 to-green-500/10",
      badgeColor: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Fantasy Sports Trending",
      stats: [
        { name: "Christian McCaffrey", team: "SF", stat: "↑ 43%", category: "Roster Add", trend: "up" },
        { name: "Kyler Murray", team: "ARI", stat: "↓ 22%", category: "Roster Drop", trend: "down" },
        { name: "CeeDee Lamb", team: "DAL", stat: "↑ 68%", category: "Start Rate", trend: "up" },
        { name: "Gus Edwards", team: "LAC", stat: "↓ 31%", category: "Bench Rate", trend: "down" }
      ],
      icon: <Users className="h-5 w-5 text-green-500" />,
      color: "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10",
      badgeColor: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      title: "Soccer Stats Leaders",
      stats: [
        { name: "Erling Haaland", team: "MCI", stat: "27", category: "Goals", trend: "up" },
        { name: "Kevin De Bruyne", team: "MCI", stat: "16", category: "Assists", trend: "up" },
        { name: "Ederson", team: "MCI", stat: "18", category: "Clean Sheets", trend: "up" },
        { name: "Bruno Fernandes", team: "MUN", stat: "86%", category: "Pass Accuracy", trend: "down" }
      ],
      icon: <Star className="h-5 w-5 text-purple-500" />,
      color: "bg-gradient-to-r from-indigo-500/10 to-pink-500/10",
      badgeColor: "bg-indigo-500 hover:bg-indigo-600"
    }
  ];

  // Handle auto-rotation
  useEffect(() => {
    if (!api || !autoplay) return;
    
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [api, autoplay]);

  // Update current slide index when scrolling
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Pause autoplay when hovering
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);

  return (
    <div 
      className="relative py-4 mx-auto w-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {statsData.map((category, index) => (
            <CarouselItem key={index} className="basis-full md:basis-2/3 lg:basis-1/2">
              <Card className={`${category.color} border border-border/40 shadow-sm`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </h3>
                    <Badge className={`${category.badgeColor}`}>Live Stats</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {category.stats.map((stat, idx) => (
                      <AnimatePresence key={idx}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: idx * 0.1,
                            duration: 0.3 
                          }}
                          className="flex flex-col bg-background/90 p-3 rounded-lg border border-border/50"
                        >
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{stat.category}</span>
                            {stat.trend === "up" ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="mt-1">
                            <span className="font-bold text-lg">{stat.stat}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm font-medium">{stat.name}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-muted rounded-md">{stat.team}</span>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 lg:left-4 bg-background shadow-md" />
        <CarouselNext className="right-2 lg:right-4 bg-background shadow-md" />
      </Carousel>
      
      {/* Indicator dots */}
      <div className="flex justify-center gap-1 mt-3">
        {statsData.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${
              current === index ? "bg-primary" : "bg-muted-foreground/30"
            }`}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}