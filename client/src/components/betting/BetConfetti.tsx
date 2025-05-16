import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface BetConfettiProps {
  isWin: boolean;
  amount: number;
  duration?: number;
  onComplete?: () => void;
}

const BetConfetti: React.FC<BetConfettiProps> = ({ 
  isWin, 
  amount, 
  duration = 3000,
  onComplete 
}) => {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    if (isWin) {
      // Create confetti celebration
      const end = Date.now() + duration;
      
      // Configure more elaborate effects for bigger wins
      const intensity = amount >= 1000 ? 'high' : 
                       amount >= 500 ? 'medium' : 'normal';
      
      // Configure colors based on win size
      const colors = ['#26A69A', '#66BB6A', '#FFEE58', '#FFA726'];
      if (amount >= 1000) {
        // Add gold color for big wins
        colors.push('#FFD700');
      }
      
      // Fire confetti in multiple bursts
      const frame = () => {
        confetti({
          particleCount: intensity === 'high' ? 150 : 
                         intensity === 'medium' ? 100 : 70,
          spread: intensity === 'high' ? 100 : 
                  intensity === 'medium' ? 80 : 60,
          origin: { y: 0.6 },
          colors: colors,
          gravity: 1.2,
          scalar: 1.2,
          drift: 0.5,
          shapes: ['circle', 'square']
        });
        
        if (intensity === 'high') {
          // Fire from both sides for high intensity
          setTimeout(() => {
            confetti({
              particleCount: 80,
              angle: 60,
              spread: 70,
              origin: { x: 0, y: 0.6 },
              colors: colors
            });
          }, 200);
          
          setTimeout(() => {
            confetti({
              particleCount: 80,
              angle: 120,
              spread: 70,
              origin: { x: 1, y: 0.6 },
              colors: colors
            });
          }, 300);
        }
        
        // Keep firing until duration ends
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else {
          setVisible(false);
          if (onComplete) {
            onComplete();
          }
        }
      };
      
      frame();
    } else {
      // No confetti for losses, just hide after duration
      const timeout = setTimeout(() => {
        setVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);
      
      return () => clearTimeout(timeout);
    }
  }, [isWin, amount, duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-black/80 dark:bg-black/90 text-white p-8 rounded-lg max-w-md text-center shadow-xl">
        {isWin ? (
          <>
            <div className="text-3xl font-bold mb-2 text-green-400">🏆 YOU WON! 🏆</div>
            <div className="text-5xl font-bold mb-4 text-green-400">${amount.toFixed(2)}</div>
            <div className="text-lg">Congratulations on your win!</div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold mb-2 text-red-400">Not this time...</div>
            <div className="text-lg mb-4">Don't give up! Try again on your next bet.</div>
            <div className="text-sm opacity-80">Remember to bet responsibly.</div>
          </>
        )}
      </div>
    </div>
  );
};

export default BetConfetti;