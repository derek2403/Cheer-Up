import { useState, useEffect, Suspense } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Yellow from '../components/yellow';

// 3D Model component for the ball
function BallModel({ position = [0, 0, 0] }) {
  const { scene } = useGLTF('/assets/glb/ball.glb');
  return <primitive object={scene} position={position} scale={[0.5, 0.5, 0.5]} />;
}

export default function Rack() {
  // State to track if the component is mounted (for client-side rendering)
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 to-black">
      <Head>
        <title>Rack</title>
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        
        {/* Rack container */}
        <div className="relative w-full max-w-4xl">
          {/* Rack image */}
          <Image 
            src="/assets/rack.png" 
            alt="Rack" 
            layout="responsive"
            width={500}
            height={600}
            className="object-contain"
            priority
          />
          
          {/* Yellow ball component overlay */}
          {mounted && (
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="flex justify-center items-center h-full">
                <div className="w-[80%] h-[80%]">
                  <Yellow />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
