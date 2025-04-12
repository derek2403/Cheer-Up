import { Canvas } from '@react-three/fiber'
import ModelLoader from '../components/ModelLoader'
import { OrbitControls, Environment, PerspectiveCamera, Sky, Cloud } from '@react-three/drei'
import { Suspense } from 'react'

export default function RoomScene() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={75} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <spotLight position={[0, 5, 0]} angle={0.5} penumbra={1} intensity={1} />
        
        {/* Sky with clouds */}
        <Sky sunPosition={[0, 1, 0]} turbidity={10} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <group position={[0, 50, 0]}>
          <Cloud position={[-4, 2, 0]} speed={0.2} opacity={0.5} />
          <Cloud position={[4, -2, 0]} speed={0.2} opacity={0.5} />
          <Cloud position={[0, 0, 0]} speed={0.2} opacity={0.5} />
        </group>
        
        <Suspense fallback={null}>
          <group position={[0, 0, 0]} rotation={[0, Math.PI * 0.65, 0]}>  {/* Adjusted position from [0, 10, 0] to [0, 0, 0] */}
            {/* Back wall */}
            <mesh position={[0, 0, -5]} rotation={[0, 0, 0]}>
              <boxGeometry args={[10, 4, 0.2]} />
              <meshStandardMaterial color="#6D5B8C" />
            </mesh>
            {/* Right wall */}
            <mesh position={[5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <boxGeometry args={[10, 4, 0.2]} />
              <meshStandardMaterial color="#6D5B8C" />
            </mesh>
            
            {/* Floor */}
            <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[10, 10, 0.2]} />
              <meshStandardMaterial color="#00BFFF" />
            </mesh>
            <ModelLoader
              modelPath="/models/floor_tiles.obj"
              mtlPath="/models/floor_tiles.mtl"
              position={[0, -2, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              scale={1}
            />
            
            {/* TV Stand */}
            <ModelLoader
              modelPath="/models/TV_stand.obj"
              mtlPath="/models/TV_stand.mtl"
              position={[4.3, -2, 0]}
              rotation={[0, Math.PI, 0]}
              scale={1.5}
            />

            {/* TV */}
            <ModelLoader
              modelPath="/models/TV.obj"
              mtlPath="/models/TV.mtl"
              position={[4.3, -0.8, 0]}
              rotation={[0, Math.PI, 0]}
              scale={1.5}
            />
            
            {/* Left curtain - rotated 90 degrees */}
            <ModelLoader
              modelPath="/models/curtains.obj"
              mtlPath="/models/curtains.mtl"
              position={[-3, -1.5, -4.8]}
              rotation={[0, Math.PI / 2, 0]}
              scale={1}
            />

            {/* Right curtain - rotated 90 degrees */}
            <ModelLoader
              modelPath="/models/curtains.obj"
              mtlPath="/models/curtains.mtl"
              position={[3, -1.5, -4.3]}
              rotation={[0, -Math.PI / 2, 0]}
              scale={1}
            />
            {/* Window */}
            <ModelLoader
              modelPath="/models/window.obj"
              mtlPath="/models/window.mtl"
              position={[3, -1.5, -4.7]}  
              rotation={[0, -Math.PI/2, 0]}
              scale={1}
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