import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MascotProps {
  emotion?: 'happy' | 'excited' | 'thinking' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const Mascot: React.FC<MascotProps> = ({ 
  emotion = 'default', 
  size = 'md',
  className = '',
  animate = true
}) => {
  const [isWaving, setIsWaving] = useState(false);
  
  // Size classes for the mascot container
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  // Emotion-specific styling and animations
  const emotionConfig = {
    default: {
      primaryColor: 'text-green-500',
      secondaryColor: 'text-blue-600',
      eyeStyle: 'rounded-full',
      mouthStyle: 'rounded-md w-6 h-2'
    },
    happy: {
      primaryColor: 'text-green-500',
      secondaryColor: 'text-blue-600',
      eyeStyle: 'rounded-full',
      mouthStyle: 'rounded-full w-8 h-4'
    },
    excited: {
      primaryColor: 'text-green-600',
      secondaryColor: 'text-blue-700',
      eyeStyle: 'rounded-full',
      mouthStyle: 'rounded-full w-10 h-5'
    },
    thinking: {
      primaryColor: 'text-green-500',
      secondaryColor: 'text-blue-600',
      eyeStyle: 'rounded-full',
      mouthStyle: 'w-6 h-1 rounded-md'
    }
  };
  
  // Basic looping animation for mascot
  useEffect(() => {
    if (animate) {
      const timer = setInterval(() => {
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 1000);
      }, 5000);
      
      return () => clearInterval(timer);
    }
  }, [animate]);
  
  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: isWaving ? [0, 5, -5, 0] : 0
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut" 
        }}
      >
        {/* Mascot Body */}
        <div className={`relative flex flex-col items-center ${emotionConfig[emotion].primaryColor}`}>
          {/* Head */}
          <div className="w-full h-full bg-gradient-to-b from-green-500 to-green-600 rounded-full shadow-lg flex items-center justify-center">
            {/* Face Container */}
            <div className="relative w-3/4 h-3/4 flex flex-col items-center justify-center">
              {/* Eyes */}
              <div className="flex justify-between w-3/4 mb-2">
                <motion.div 
                  className={`bg-white ${emotionConfig[emotion].eyeStyle} w-4 h-4 flex items-center justify-center`}
                  animate={animate ? { 
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  <div className="bg-black rounded-full w-2 h-2"></div>
                </motion.div>
                <motion.div 
                  className={`bg-white ${emotionConfig[emotion].eyeStyle} w-4 h-4 flex items-center justify-center`}
                  animate={animate ? { 
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  <div className="bg-black rounded-full w-2 h-2"></div>
                </motion.div>
              </div>
              
              {/* Mouth */}
              <motion.div 
                className={`bg-white ${emotionConfig[emotion].mouthStyle} mt-1`}
                animate={emotion === 'excited' && animate ? { 
                  scaleY: [1, 1.5, 1],
                } : {}}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
          </div>
          
          {/* Floating Badge - WeParlay Logo */}
          <AnimatePresence>
            {size === 'lg' && (
              <motion.div 
                className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                WeParlay!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Mascot;