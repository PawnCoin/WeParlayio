import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Star, Trophy, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TournamentRecommendation {
  id: number;
  name: string;
  image?: string;
  entryFee: number | 'Free';
  prizeMoney: number;
  participants: number;
  endDate: string;
  tags: string[];
  popularity: 'hot' | 'trending' | 'popular' | null;
}

interface TournamentRecommendationsProps {
  recommendations: TournamentRecommendation[];
}

const TournamentRecommendations: React.FC<TournamentRecommendationsProps> = ({ 
  recommendations 
}) => {
  const { toast } = useToast();
  
  const handleJoinPool = (tournamentName: string) => {
    toast({
      title: "Pool Joined",
      description: `You've successfully joined the ${tournamentName} tournament.`,
    });
  };

  const getPopularityIcon = (popularity: 'hot' | 'trending' | 'popular' | null) => {
    switch(popularity) {
      case 'hot':
        return <Flame className="h-4 w-4 text-red-500" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'popular':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Recommended For You</h3>
        <Button variant="link" className="p-0 h-auto text-sm text-primary">View all</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((tournament, idx) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          >
            <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
              <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                {tournament.image ? (
                  <img 
                    src={tournament.image} 
                    alt={tournament.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Trophy className="h-16 w-16 text-primary/60" />
                )}
                {tournament.popularity && (
                  <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1 shadow-md">
                    {getPopularityIcon(tournament.popularity)}
                    <span className="capitalize">{tournament.popularity}</span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">{tournament.name}</h4>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="h-3.5 w-3.5 mr-1" /> Ends {tournament.endDate}
                  <span className="mx-2">•</span>
                  <Users className="h-3.5 w-3.5 mr-1" /> {tournament.participants} participants
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {tournament.tags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-xs bg-primary/5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Entry Fee</div>
                    <div className="font-medium">
                      {tournament.entryFee === 'Free' ? (
                        <span className="text-green-600 dark:text-green-400">Free</span>
                      ) : (
                        `$${tournament.entryFee}`
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm"
                    onClick={() => handleJoinPool(tournament.name)}
                  >
                    Join Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TournamentRecommendations;