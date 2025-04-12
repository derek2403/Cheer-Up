import { useState, useEffect } from 'react';

const useGradientBackground = () => {
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientColors, setGradientColors] = useState({
    color1: 'rgba(255, 255, 255, 0.8)',
    color2: 'rgba(173, 216, 230, 0.9)'
  });

  // Animate gradient background
  useEffect(() => {
    const interval = setInterval(() => {
      // Change gradient angle
      setGradientAngle(prev => (prev + 1) % 360);
      
      // Occasionally change gradient colors slightly
      if (Math.random() > 0.95) {
        setGradientColors({
          color1: `rgba(255, 255, 255, ${0.7 + Math.random() * 0.3})`,
          color2: `rgba(${173 + Math.floor(Math.random() * 30)}, ${216 + Math.floor(Math.random() * 30)}, ${230 + Math.floor(Math.random() * 25)}, 0.9)`
        });
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return { gradientAngle, gradientColors };
};

export default useGradientBackground; 