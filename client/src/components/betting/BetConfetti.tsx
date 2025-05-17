import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface BetConfettiProps {
  duration?: number;
  particleCount?: number;
  spread?: number;
  colors?: string[];
}

const BetConfetti: React.FC<BetConfettiProps> = ({
  duration = 3000,
  particleCount = 100,
  spread = 70,
  colors = ['#1e88e5', '#43a047', '#ffeb3b', '#e53935', '#5e35b1']
}) => {
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    if (!isActive) return;
    
    // Create the confetti effect
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({
        particleCount: particleCount / 10,
        angle: 60,
        spread,
        origin: { x: 0, y: 0.8 },
        colors,
        disableForReducedMotion: true
      });
      
      confetti({
        particleCount: particleCount / 10,
        angle: 120,
        spread,
        origin: { x: 1, y: 0.8 },
        colors,
        disableForReducedMotion: true
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
    
    // Cleanup function to stop the animation if component unmounts
    return () => {
      setIsActive(false);
    };
  }, [isActive, particleCount, spread, duration, colors]);
  
  // This component doesn't render anything visible
  return null;
};

export default BetConfetti;