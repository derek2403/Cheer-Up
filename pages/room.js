import { Canvas, useFrame } from '@react-three/fiber'
import ModelLoader from '../components/ModelLoader'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, Sky } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useRouter } from 'next/router'
import Cloud from '../components/cloud'
import Header from '../components/header'
// import GalaxyBackground from '../components/GalaxyBackground'

// Either import your CSS module
// import styles from '../styles/Room.module.css'

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

// Character component
function Character({ position = [0, 0, 0] }) {
  const characterRef = useRef()
  const router = useRouter()
  const [direction, setDirection] = useState(new THREE.Vector3())
  const [rotation, setRotation] = useState(0)
  const moveSpeed = 0.1
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  })

  // TV Stand collision box
  const tvStandBounds = {
    position: new THREE.Vector3(-3, -2, -4.4),
    size: new THREE.Vector3(2, 2, 2) // Approximate size of TV stand
  }

  // Floor boundaries (based on the floor mesh)
  const floorLimits = {
    minX: -5,  // Left edge of floor (half of width)
    maxX: 5,   // Right edge of floor (half of width)
    minZ: -5,  // Back edge of floor (half of length)
    maxZ: 5,   // Front edge of floor (half of length)
  }

  // Check collision with TV stand
  const checkTVStandCollision = (position) => {
    const distance = position.distanceTo(tvStandBounds.position)
    return distance < 1.5 // Collision radius
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.current.forward = true
          break
        case 's':
        case 'arrowdown':
          keys.current.backward = true
          break
        case 'a':
        case 'arrowleft':
          keys.current.left = true
          break
        case 'd':
        case 'arrowright':
          keys.current.right = true
          break
      }
    }

    const handleKeyUp = (e) => {
      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.current.forward = false
          break
        case 's':
        case 'arrowdown':
          keys.current.backward = false
          break
        case 'a':
        case 'arrowleft':
          keys.current.left = false
          break
        case 'd':
        case 'arrowright':
          keys.current.right = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    const { forward, backward, left, right } = keys.current
    
    // Calculate movement direction
    const moveDirection = new THREE.Vector3()
    if (forward) moveDirection.z -= 1
    if (backward) moveDirection.z += 1
    if (left) moveDirection.x -= 1
    if (right) moveDirection.x += 1
    
    // Normalize direction if moving
    if (moveDirection.length() > 0) {
      moveDirection.normalize()
      // Update character rotation to face movement direction
      const targetRotation = Math.atan2(moveDirection.x, moveDirection.z)
      setRotation(targetRotation)
    }
    
    // Update position with floor boundary checks
    if (characterRef.current) {
      const newX = characterRef.current.position.x + moveDirection.x * moveSpeed
      const newZ = characterRef.current.position.z + moveDirection.z * moveSpeed

      // Check floor boundaries before updating position
      if (newX >= floorLimits.minX && newX <= floorLimits.maxX) {
        characterRef.current.position.x = newX
      }
      if (newZ >= floorLimits.minZ && newZ <= floorLimits.maxZ) {
        characterRef.current.position.z = newZ
      }
      
      characterRef.current.rotation.y = rotation

      // Check for TV stand collision
      const characterPosition = new THREE.Vector3(
        characterRef.current.position.x,
        characterRef.current.position.y,
        characterRef.current.position.z
      )

      if (checkTVStandCollision(characterPosition)) {
        // Show modal and navigate to rack.js
        if (confirm('Would you like to go to the rack?')) {
          router.push('/rack')
        }
      }
    }
  })

  return (
    <>
      <group ref={characterRef} position={position}>
        <mesh>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </group>
      {/* Visual helper for collision box */}
      <CollisionBoxHelper 
        position={tvStandBounds.position} 
        size={tvStandBounds.size} 
      />
    </>
  )
}

// TV component with click handling and dinosaur image
function TVModel({ position, rotation, scale }) {
  const router = useRouter()
  const [tvTexture, setTvTexture] = useState(null)
  
  useEffect(() => {
    // Load the dinosaur texture for the TV screen
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load('/dinosaur.png', (texture) => {
      setTvTexture(texture)
    })
  }, [])
  
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
      
      {/* TV Screen with dinosaur image - rotated to face right, moved up and lengthened */}
      {tvTexture && (
        <mesh position={[0.1, 0.8, 0.01]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.3, 0.8]} />
          <meshBasicMaterial map={tvTexture} transparent={true} />
        </mesh>
      )}
    </group>
  )
}

export default function RoomScene() {
  const router = useRouter()
  
  return (
    <div className="container">
      <Header />
      
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
            
            {/* Add the character */}
            <Character position={[0, -1.5, 0]} />
            
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
                <meshStandardMaterial color="#4A6C8A" />
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
      
      <style jsx>{`
        .container {
          width: 100%;
          min-height: 100vh;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  )
} 