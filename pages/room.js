import { Canvas } from '@react-three/fiber'
import ModelLoader from '../components/ModelLoader'
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import Header from '../components/header'
import CloudBackground from '../components/cloud'

function GLBModel({ url, position, rotation, scale, materialColor }) {
  const { scene } = useGLTF(url)
  return (
    <primitive 
      object={scene} 
      position={position} 
      rotation={rotation} 
      scale={scale}
    >
      <meshStandardMaterial 
        color={materialColor}
        metalness={0.5}
        roughness={0.5}
      />
    </primitive>
  )
}

export default function RoomScene() {
  return (
    <>
      <Header />
      <CloudBackground />
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={75} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 3, 3]} intensity={1} />
          <spotLight position={[0, 5, 0]} angle={0.5} penumbra={1} intensity={1} />

          <Suspense fallback={null}>
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
              <ModelLoader
                modelPath="/models/TV.obj"
                mtlPath="/models/TV.mtl"
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
                url="/models/rack.glb"
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
    </>
  )
} 