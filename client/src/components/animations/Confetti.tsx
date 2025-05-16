import React, { useCallback, useEffect, useRef } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

// WeParlay color theme for confetti
const DEFAULT_COLORS = [
  '#0074D9', // blue from logo
  '#2ECC40', // green from logo
  '#FF851B', // orange from logo
  '#FFDC00', // yellow
  '#7FDBFF', // light blue
  '#FF4136', // red
  '#B10DC9', // purple
  '#FFFFFF', // white
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  angle: number;
  angularVelocity: number;
  shape: 'circle' | 'square' | 'triangle';
};

const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  particleCount = 200,
  colors = DEFAULT_COLORS,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Create particles with WeParlay themed colors
  const createParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    const shapes = ['circle', 'square', 'triangle'] as const;
    
    particles.current = Array.from({ length: particleCount }, () => {
      const x = Math.random() * width;
      const y = -20 - Math.random() * 100; // Start above the visible area
      const vx = (Math.random() - 0.5) * 10;
      const vy = Math.random() * 3 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 10 + 5;
      const angle = Math.random() * Math.PI * 2;
      const angularVelocity = (Math.random() - 0.5) * 0.2;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      return { x, y, vx, vy, color, size, angle, angularVelocity, shape };
    });
  }, [particleCount, colors]);

  // Draw a single confetti particle
  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D, 
    particle: Particle
  ) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.angle);
    ctx.fillStyle = particle.color;
    
    // Different shapes for variety
    if (particle.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (particle.shape === 'square') {
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    } else if (particle.shape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(0, -particle.size / 2);
      ctx.lineTo(particle.size / 2, particle.size / 2);
      ctx.lineTo(-particle.size / 2, particle.size / 2);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }, []);

  // Animate all confetti particles
  const animate = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Initialize startTime
    if (startTimeRef.current === 0) {
      startTimeRef.current = timestamp;
    }
    
    // Calculate elapsed time
    const elapsed = timestamp - startTimeRef.current;
    
    // Check if animation should stop
    if (elapsed > duration) {
      startTimeRef.current = 0;
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      particles.current = [];
      return;
    }
    
    // Update and draw particles
    particles.current.forEach((particle) => {
      // Apply gravity and wind
      particle.vy += 0.1;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.angle += particle.angularVelocity;
      
      // Draw the particle
      drawParticle(ctx, particle);
    });
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(animate);
  }, [drawParticle, duration]);

  // Start animation when active changes to true
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    
    // Set canvas dimensions to match window size
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    // Update size initially and on resize
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Create particles and start animation
    createParticles();
    startTimeRef.current = 0;
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [active, createParticles, animate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default Confetti;