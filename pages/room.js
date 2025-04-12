import { Canvas, useFrame } from '@react-three/fiber'
import ModelLoader from '../components/ModelLoader'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, Sky, useTexture } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { MOUSE } from 'three'
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

// Wood Floor component with procedural texture
function WoodFloor() {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    varying vec2 vUv;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      // Create wood grain pattern
      vec2 st = vUv * 10.0;
      float woodGrain = random(floor(st * vec2(1.0, 10.0)));
      
      // Create plank lines
      float plankWidth = 0.1; // Width of each plank
      float plankLine = step(mod(vUv.y * 5.0, plankWidth), 0.002); // Horizontal lines
      float verticalLine = step(mod(vUv.x * 5.0, 1.0), 0.002); // Vertical lines at plank edges
      
      // Mix colors
      vec3 woodColor = mix(
        vec3(0.82, 0.70, 0.54), // Light wood color
        vec3(0.72, 0.60, 0.44), // Darker wood color
        woodGrain * 0.3 + plankLine + verticalLine
      );
      
      gl_FragColor = vec4(woodColor, 1.0);
    }
  `

  return (
    <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <boxGeometry args={[10, 10, 0.2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.DoubleSide}
      />
    </mesh>
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
            <WoodFloor />
            
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
          mouseButtons={{
            LEFT: THREE.MOUSE.LEFT,
            MIDDLE: THREE.MOUSE.RIGHT,
            RIGHT: THREE.MOUSE.NONE
          }}
        />
      </Canvas>
    </div>
  )
} 