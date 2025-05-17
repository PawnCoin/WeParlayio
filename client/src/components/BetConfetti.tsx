import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const BetConfetti: React.FC = () => {
  useEffect(() => {
    // Fire confetti when component mounts
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Celebrate from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#1E88E5', '#26A69A', '#FFCA28']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#1E88E5', '#26A69A', '#FFCA28']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default BetConfetti;