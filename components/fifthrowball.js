import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// Fifth row component with one clickable ball (no rack)
export default function FifthRowBall() {
  const [mounted, setMounted] = useState(false);
  const [sparkleTime, setSparkleTime] = useState(0);
  const [randomizedBalls, setRandomizedBalls] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalScale, setModalScale] = useState(0);
  const [modalOpacity, setModalOpacity] = useState(0);
  const [selectedBall, setSelectedBall] = useState(null);
  const router = useRouter();
  
  // Animation frame reference
  const animationRef = useRef();
  
  useEffect(() => {
    setMounted(true);
    
    // Sparkle animation
    const animate = () => {
      setSparkleTime(prev => prev + 0.05);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Generate randomized ball placements
    generateRandomBalls();
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Function to shuffle an array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Function to generate randomized ball placements
  const generateRandomBalls = () => {
    // Base colors - only the 5 specified colors
    const baseColors = [
      { color: '#FFD700', gradientColor: '#B8860B', name: 'yellow', story: 'Joy: This memory orb represents the happiness of childhood adventures and carefree summer days.' },  // Yellow
      { color: '#4169E1', gradientColor: '#00008B', name: 'blue', story: 'Sadness: This memory orb holds the bittersweet moments of growth, loss, and the beauty of melancholy.' },    // Blue
      { color: '#2E8B57', gradientColor: '#006400', name: 'green', story: 'Disgust: This memory orb contains the protective instinct that helps avoid physical and social threats.' },   // Green
      { color: '#8A2BE2', gradientColor: '#4B0082', name: 'purple', story: 'Fear: This memory orb embodies the cautious moments that kept you safe and taught valuable lessons.' },  // Purple
      { color: '#FF4500', gradientColor: '#8B0000', name: 'red', story: 'Anger: This memory orb represents the passionate energy that fuels determination and protects what matters.' }      // Red
    ];
    
    // Shuffle the colors
    const shuffledColors = shuffleArray([...baseColors]);
    
    // Make the middle ball (index 2) clickable and add bling
    const clickableIndex = 2;
    shuffledColors[clickableIndex] = { 
      ...shuffledColors[clickableIndex], 
      clickable: true, 
      bling: true 
    };
    
    // Add bling to one more random ball (not the clickable one)
    let blingIndex;
    do {
      blingIndex = Math.floor(Math.random() * 5);
    } while (blingIndex === clickableIndex);
    
    shuffledColors[blingIndex] = { 
      ...shuffledColors[blingIndex], 
      bling: true 
    };
    
    setRandomizedBalls(shuffledColors);
  };

  // Function to open modal with animation
  const openModal = (ball) => {
    setSelectedBall(ball);
    setModalOpen(true);
    
    // Animate the modal opening
    let startTime;
    const duration = 800; // 800ms for the animation
    
    const animateModal = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      setModalScale(easedProgress);
      setModalOpacity(easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateModal);
      }
    };
    
    requestAnimationFrame(animateModal);
  };

  // Function to close modal with animation
  const closeModal = () => {
    let startTime;
    const duration = 500; // 500ms for closing (faster than opening)
    
    const animateModalClose = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation (ease-in cubic)
      const easedProgress = Math.pow(1 - progress, 3);
      
      setModalScale(easedProgress);
      setModalOpacity(easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateModalClose);
      } else {
        setModalOpen(false);
      }
    };
    
    requestAnimationFrame(animateModalClose);
  };

  if (!mounted || randomizedBalls.length === 0) return null;

  // Function to render a ball with optional bling effect and clickability
  const renderBall = (ball, index) => (
    <div 
      key={index}
      className={`rounded-full shadow-lg relative hover-float ${ball.clickable ? 'cursor-pointer' : ''}`}
      style={{
        width: '80px',
        height: '80px',
        background: `radial-gradient(circle at 30% 30%, ${ball.color}, ${ball.gradientColor})`,
        boxShadow: `0 0 20px 8px rgba(${
          ball.color === '#FFD700' ? '255, 215, 0' : 
          ball.color === '#4169E1' ? '65, 105, 225' : 
          ball.color === '#2E8B57' ? '46, 139, 87' : 
          ball.color === '#8A2BE2' ? '138, 43, 226' : 
          ball.color === '#FF4500' ? '255, 69, 0' : 
          '255, 255, 255'}, 0.3), 
          inset 0 0 15px 8px rgba(255, 255, 255, 0.5)`,
        position: 'relative',
        margin: '0 8px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: ball.clickable ? 'pointer' : 'default',
        zIndex: 10
      }}
      onClick={() => {
        if (ball.clickable) {
          openModal(ball);
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-15px)';
        e.currentTarget.style.boxShadow = `0 15px 25px 8px rgba(${
          ball.color === '#FFD700' ? '255, 215, 0' : 
          ball.color === '#4169E1' ? '65, 105, 225' : 
          ball.color === '#2E8B57' ? '46, 139, 87' : 
          ball.color === '#8A2BE2' ? '138, 43, 226' : 
          ball.color === '#FF4500' ? '255, 69, 0' : 
          '255, 255, 255'}, 0.2), 
          inset 0 0 15px 8px rgba(255, 255, 255, 0.5)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 0 20px 8px rgba(${
          ball.color === '#FFD700' ? '255, 215, 0' : 
          ball.color === '#4169E1' ? '65, 105, 225' : 
          ball.color === '#2E8B57' ? '46, 139, 87' : 
          ball.color === '#8A2BE2' ? '138, 43, 226' : 
          ball.color === '#FF4500' ? '255, 69, 0' : 
          '255, 255, 255'}, 0.3), 
          inset 0 0 15px 8px rgba(255, 255, 255, 0.5)`;
      }}
    >
      {/* Shine effect */}
      <div 
        className="absolute rounded-full bg-white opacity-70"
        style={{
          width: '25px',
          height: '25px',
          top: '15px',
          left: '15px',
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)'
        }}
      />
      
      {/* Clickable indicator - only for clickable ball */}
      {ball.clickable && (
        <div className="absolute inset-0 rounded-full border-2 border-white opacity-70 animate-pulse" />
      )}
      
      {/* Bling bling effect - only for balls with bling property */}
      {ball.bling && (
        <>
          {/* Sparkle 1 */}
          <div 
            className="absolute"
            style={{
              width: '12px',
              height: '12px',
              top: Math.sin(sparkleTime * 1.5) * 8 + 8,
              right: Math.cos(sparkleTime) * 8 + 8,
              opacity: (Math.sin(sparkleTime * 2) + 1) / 2,
              transform: `rotate(${sparkleTime * 30}deg)`,
              filter: 'blur(0.5px)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M12,2L15,9L22,9L16,14L18,21L12,17L6,21L8,14L2,9L9,9L12,2Z" />
            </svg>
          </div>
          
          {/* Sparkle 2 */}
          <div 
            className="absolute"
            style={{
              width: '8px',
              height: '8px',
              bottom: Math.cos(sparkleTime * 1.2) * 12 + 12,
              left: Math.sin(sparkleTime * 0.8) * 12 + 12,
              opacity: (Math.sin(sparkleTime * 2 + 1) + 1) / 2,
              transform: `rotate(${-sparkleTime * 45}deg)`,
              filter: 'blur(0.5px)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M12,2L15,9L22,9L16,14L18,21L12,17L6,21L8,14L2,9L9,9L12,2Z" />
            </svg>
          </div>
          
          {/* Pulsing glow overlay */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)',
              opacity: (Math.sin(sparkleTime) + 1) / 4,
              mixBlendMode: 'overlay'
            }}
          />
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="w-full flex justify-center" style={{ marginTop: '-80px', marginBottom: '55px' }}>
        <div className="flex" style={{ gap: '40px' }}>
          {randomizedBalls.map((ball, ballIndex) => renderBall(ball, `fifth-row-${ballIndex}`))}
        </div>
      </div>
      
      {/* Modal overlay */}
      {modalOpen && selectedBall && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            opacity: modalOpacity
          }}
          onClick={closeModal}
        >
          {/* Modal content - prevent click propagation */}
          <div 
            className="relative rounded-xl overflow-hidden"
            style={{ 
              transform: `scale(${modalScale})`,
              transformOrigin: 'center center',
              maxWidth: '90%',
              maxHeight: '90%',
              transition: 'transform 0.05s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large ball display */}
            <div className="flex flex-col items-center p-8 rounded-xl" style={{
              background: `radial-gradient(circle at 30% 30%, ${selectedBall.color}, ${selectedBall.gradientColor})`,
              boxShadow: `0 0 40px 20px rgba(${
                selectedBall.color === '#FFD700' ? '255, 215, 0' : 
                selectedBall.color === '#4169E1' ? '65, 105, 225' : 
                selectedBall.color === '#2E8B57' ? '46, 139, 87' : 
                selectedBall.color === '#8A2BE2' ? '138, 43, 226' : 
                selectedBall.color === '#FF4500' ? '255, 69, 0' : 
                '255, 255, 255'}, 0.4)`
            }}>
              {/* Ball content */}
              <div className="rounded-full mb-6" style={{
                width: '150px',
                height: '150px',
                background: `radial-gradient(circle at 30% 30%, ${selectedBall.color}, ${selectedBall.gradientColor})`,
                boxShadow: 'inset 0 0 30px 15px rgba(255, 255, 255, 0.3)'
              }}>
                {/* Shine effect */}
                <div 
                  className="absolute rounded-full bg-white opacity-70"
                  style={{
                    width: '50px',
                    height: '50px',
                    top: '30px',
                    left: '30px',
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)'
                  }}
                />
              </div>
              
              {/* Story text */}
              <div className="text-white text-center max-w-md">
                <h2 className="text-2xl font-bold mb-4 capitalize">{selectedBall.name}</h2>
                <p className="text-lg mb-6">{selectedBall.story}</p>
                
                {/* Continue button */}
                <button 
                  className="px-6 py-2 bg-white text-gray-800 rounded-full font-bold hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    closeModal();
                    setTimeout(() => {
                      router.push('/corememories');
                    }, 500);
                  }}
                >
                  Continue to Core Memories
                </button>
              </div>
              
              {/* Close button */}
              <button 
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={closeModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
