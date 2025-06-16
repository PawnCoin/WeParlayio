import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackData {
  rating: number;
  category: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
}

const UserSatisfactionWidget: React.FC = () => {
  const [showWidget, setShowWidget] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Show widget after 30 seconds of usage or on specific triggers
    const timer = setTimeout(() => {
      setShowWidget(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    try {
      const feedbackData: FeedbackData = {
        rating,
        category,
        message: feedback,
        urgency: rating <= 2 ? 'high' : rating <= 3 ? 'medium' : 'low'
      };

      // Submit feedback to backend
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: "Feedback Received",
          description: "Thank you for helping us improve WeParlay!",
        });

        // Auto-hide after successful submission
        setTimeout(() => {
          setShowWidget(false);
        }, 3000);
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Please try again or contact support directly.",
        variant: "destructive"
      });
    }
  };

  if (!showWidget) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            How's Your Experience?
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWidget(false)}
              className="ml-auto h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!submitted ? (
            <>
              {/* Rating Stars */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rate your experience:</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'general', label: 'General' },
                    { id: 'betting', label: 'Betting' },
                    { id: 'performance', label: 'Speed' },
                    { id: 'ui', label: 'Interface' },
                    { id: 'bug', label: 'Bug Report' }
                  ].map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={category === cat.id ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setCategory(cat.id)}
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Feedback Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tell us more (optional):</label>
                <Textarea
                  placeholder="Your feedback helps us improve..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Urgency Indicator */}
              {rating > 0 && rating <= 2 && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  This will be prioritized for immediate attention
                </div>
              )}

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit} 
                disabled={rating === 0}
                className="w-full"
              >
                Submit Feedback
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-green-700">Thank You!</h3>
              <p className="text-sm text-gray-600">
                Your feedback has been received and will help us improve WeParlay.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSatisfactionWidget;