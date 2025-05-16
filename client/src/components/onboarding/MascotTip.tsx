import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingContext } from './OnboardingProvider';
import Mascot from './Mascot';
import { 
  Card, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ThumbsUp, Gift, Award } from 'lucide-react';

type TipType = 'tip' | 'achievement' | 'reward';

interface MascotTipProps {
  message: string;
  type?: TipType;
  xpReward?: number;
  duration?: number; // in milliseconds, how long before auto-dismiss
  onDismiss?: () => void;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

const MascotTip: React.FC<MascotTipProps> = ({
  message,
  type = 'tip',
  xpReward = 0,
  duration = 0, // 0 means don't auto-dismiss
  onDismiss,
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { addXp } = useOnboardingContext();
  
  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4'
  };
  
  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration]);
  
  // Handle XP reward when tip is shown
  useEffect(() => {
    if (xpReward > 0 && isVisible) {
      addXp(xpReward);
    }
  }, [xpReward, isVisible, addXp]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };
  
  // Emotion based on tip type
  const getEmotion = () => {
    switch(type) {
      case 'achievement':
        return 'excited';
      case 'reward':
        return 'happy';
      default:
        return 'thinking';
    }
  };
  
  // Icon based on tip type
  const getIcon = () => {
    switch(type) {
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'reward':
        return <Gift className="h-5 w-5 text-green-500" />;
      default:
        return <ThumbsUp className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Background color based on tip type
  const getBgColor = () => {
    switch(type) {
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'reward':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positionClasses[position]} z-50 w-72`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Card className={`shadow-lg border-2 ${getBgColor()}`}>
            <CardContent className="pt-4 pb-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Mascot emotion={getEmotion()} size="sm" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {getIcon()}
                      <span className="font-semibold text-sm">
                        {type === 'achievement' ? 'Achievement Unlocked!' : 
                         type === 'reward' ? 'Reward Earned!' : 'Betting Tip'}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 rounded-full" 
                      onClick={handleDismiss}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                </div>
              </div>
            </CardContent>
            
            {xpReward > 0 && (
              <CardFooter className="pt-0 pb-3">
                <div className="w-full bg-green-100 dark:bg-green-900/30 rounded px-3 py-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-green-800 dark:text-green-300">XP Reward</span>
                  <span className="text-xs font-bold text-green-800 dark:text-green-300">+{xpReward} XP</span>
                </div>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MascotTip;