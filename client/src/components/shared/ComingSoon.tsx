import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Clock } from 'lucide-react';

interface ComingSoonProps {
  featureName: string;
  description?: string;
  tier?: string;
  timeline?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  featureName, 
  description = "This feature is being developed and will be available soon!", 
  tier,
  timeline = "Coming Soon"
}) => {
  return (
    <Card className="w-full max-w-md mx-auto border-dashed border-2 border-blue-300 bg-blue-50 dark:bg-blue-950">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Rocket className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-blue-700 dark:text-blue-300">{featureName}</CardTitle>
          {tier && <Badge variant="outline" className="text-blue-600">{tier}</Badge>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{timeline}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Get notified when this feature launches by following us on social media!
        </p>
      </CardContent>
    </Card>
  );
};

export default ComingSoon;