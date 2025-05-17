import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface BetConfettiProps {
  duration?: number;
  particleCount?: number;
}

const BetConfetti: React.FC<BetConfettiProps> = ({
  duration = 5000,
  particleCount = 100
}) => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    // Shoot confetti from the left
    const leftConfetti = () => {
      confetti({
        particleCount: particleCount / 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#1E40AF', '#059669', '#D97706'] // Team Colors: Blue, Green, Orange
      });
    };

    // Shoot confetti from the right
    const rightConfetti = () => {
      confetti({
        particleCount: particleCount / 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#1E40AF', '#059669', '#D97706'] // Team Colors: Blue, Green, Orange
      });
    };

    // Initial burst of confetti
    leftConfetti();
    rightConfetti();

    // Generate confetti repeatedly during the animation duration
    const interval = setInterval(() => {
      leftConfetti();
      rightConfetti();
    }, 750);

    // Clean up after duration
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsActive(false);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, particleCount, duration]);

  return null; // This component doesn't render anything visible
};

export default BetConfetti;