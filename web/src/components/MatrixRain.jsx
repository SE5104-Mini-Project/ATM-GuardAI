// src/components/MatrixRain.jsx
import { useEffect, useRef } from 'react';

const MatrixRain = ({ opacity = 0.15, speed = 50 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Matrix characters (including some cyrillic and mathematical symbols)
    const chars = "ヱ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZゲゼョロヲゴゾドボポヴッン";
    const charArray = chars.split('');

    // Animation state
    let drops = [];
    let fontSize = 14;
    let columns = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      
      // Initialize drops array
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * canvas.height;
      }
    };

    const draw = () => {
      // Create trail effect with semi-transparent black overlay
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = `rgba(0, 255, 170, ${opacity})`;
      ctx.font = `${fontSize}px monospace`;

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // Reset drop to top with some randomness
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move drop down
        drops[i]++;
      }
    };

    const animate = () => {
      draw();
      animationId = setTimeout(() => {
        requestAnimationFrame(animate);
      }, speed);
    };

    // Initialize
    resizeCanvas();
    animate();

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationId) {
        clearTimeout(animationId);
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        mixBlendMode: 'screen', // This helps blend the animation with the background
      }}
    />
  );
};

export default MatrixRain;