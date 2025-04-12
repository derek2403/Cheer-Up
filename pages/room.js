import { Canvas, useFrame } from '@react-three/fiber'
import ModelLoader from '../components/ModelLoader'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, Sky } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useRouter } from 'next/router'
import Cloud from '../components/cloud'
// import GalaxyBackground from '../components/GalaxyBackground'

function GLBModel({ url, position, rotation, scale, materialColor }) {
  const { scene } = useGLTF(url)
  const router = useRouter()
  
  // Add onClick handler for the rack model
  const handleClick = () => {
    if (url.includes('rack1.glb')) {
      router.push('/rack')
    }
  }
  
  return (
    <primitive 
      object={scene} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onClick={handleClick}
    >
      <meshStandardMaterial 
        color={materialColor}
        metalness={0.5}
        roughness={0.5}
      />
    </primitive>
  )
}

// Helper component to visualize collision box
function CollisionBoxHelper({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[size.x, size.y, size.z]} />
      <meshBasicMaterial 
        color="red" 
        wireframe={true}
        transparent={true}
        opacity={0.5}
      />
    </mesh>
  )
}

// Helper component to visualize walkable area
function WalkableAreaHelper() {
  return (
    <group position={[0, 0, 0]} rotation={[0, Math.PI * 0.65, 0]}>
      <group position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial 
            color="green" 
            wireframe={true}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      </group>
    </group>
  )
}

// TV component with click handling
function TVModel({ position, rotation, scale }) {
  const router = useRouter()
  
  const handleClick = () => {
    router.push('/chatbot')
  }
  
  return (
    <group position={position} rotation={rotation} scale={scale} onClick={handleClick}>
      <ModelLoader
        modelPath="/models/TV.obj"
        mtlPath="/models/TV.mtl"
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
      />
    </group>
  )
}

export default function RoomScene() {
  const router = useRouter()
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Add the Cloud component as background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <Cloud />
      </div>
      
      <Canvas>
        <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={75} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <spotLight position={[0, 5, 0]} angle={0.5} penumbra={1} intensity={1} />

        <Suspense fallback={null}>
          {/* Add the walkable area helper */}
          <WalkableAreaHelper />
          
          <group position={[0, 0, 0]} rotation={[0, Math.PI * 0.65, 0]}>
            {/* Back wall */}
            <mesh position={[0, 0, -5]} rotation={[0, 0, 0]}>
              <boxGeometry args={[10, 4, 0.2]} />
              <meshStandardMaterial color="#ADD8E6" />
            </mesh>
            {/* Right wall */}
            <mesh position={[5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <boxGeometry args={[10, 4, 0.2]} />
              <meshStandardMaterial color="#ADD8E6" />
            </mesh>
            
            {/* Floor */}
            <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[10, 10, 0.2]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            
            {/* TV Stand */}
            <ModelLoader
              modelPath="/models/TV_stand.obj"
              mtlPath="/models/TV_stand.mtl"
              position={[-3, -2, -4.4]}
              rotation={[0, -Math.PI/2, 0]}
              scale={1.5}
            />

            {/* TV */}
            <TVModel
              position={[-3, -0.8, -4.4]}
              rotation={[0, -Math.PI/2, 0]}
              scale={1.5}
            />

            {/* Carpet */}
            <ModelLoader
              modelPath="/models/carpet.obj"
              mtlPath="/models/carpet.mtl"
              position={[1.1, -1.8, 0]}
              rotation={[0, 0, 0]}
              scale={3}
            />

            {/* Table */}
            <ModelLoader
              modelPath="/models/table.obj"
              mtlPath="/models/table.mtl"
              position={[1.1, -1.8, 0.2]}
              rotation={[0, Math.PI/2, 0]}
              scale={2}
            />

            {/* Tall Flower */}
            <ModelLoader
              modelPath="/models/tall_flower.obj"
              mtlPath="/models/tall_flower.mtl"
              position={[4, -1.9, -4]}
              rotation={[0, 0, 0]}
              scale={1.5}
            />

            {/* Wall Lamp */}
            <ModelLoader
              modelPath="/models/wall_lamp.obj"
              mtlPath="/models/wall_lamp.mtl"
              position={[4.0, 1.5, -4.9]}
              rotation={[0, -Math.PI/2, 0]}
              scale={1.5}
            />

            {/* Rack */}
            <GLBModel
              url="/models/rack1.glb"
              position={[4.6, -2, 0]}
              rotation={[0, -Math.PI/2, 0]}
              scale={2}
              materialColor="#2D1B3C"
            />
            
            {/* Left curtain - rotated 90 degrees */}
            <ModelLoader
              modelPath="/models/curtains.obj"
              mtlPath="/models/curtains.mtl"
              position={[1, -1.8, -4.3]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={1.1}
            />
            {/* Window */}
            <ModelLoader
              modelPath="/models/window.obj"
              mtlPath="/models/window.mtl"
              position={[1, -1.8, -4.7]}  
              rotation={[0, -Math.PI/2, 0]}
              scale={1.1}
            />

            {/* Sofa */}
            <ModelLoader
              modelPath="/models/sofa.obj"
              mtlPath="/models/sofa.mtl"
              position={[1, -2, -3.7]}
              rotation={[0, -Math.PI/2, 0]}
              scale={1.8}
            />
          </group>
        </Suspense>
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
        />
      </Canvas>
    </div>
  )
} 