import { Canvas, useFrame, useThree } from '@react-three/fiber'
import ModelLoader from '../components/ModelLoader'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, Sky, useTexture, useAnimations } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { MOUSE } from 'three'
import { useRouter } from 'next/router'
import Cloud from '../components/cloud'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import Header from '../components/Header'

// Character component with animations and movement
function Character({ floorMesh, onMoveComplete }) {
  const characterRef = useRef()
  const mixerRef = useRef()
  const actionsRef = useRef({})
  const targetPositionRef = useRef(new THREE.Vector3(0, -1.8, 0))
  const isMovingRef = useRef(false)
  const modelRef = useRef()
  const [model, setModel] = useState(null)
  const roomRotation = Math.PI * 0.65 // Room's rotation angle
  
  // Load character model and animations
  useEffect(() => {
    const fbxLoader = new FBXLoader()
    const textureLoader = new THREE.TextureLoader()
    
    fbxLoader.load('/character/idle.fbx', (fbxModel) => {
      console.log('Loaded idle.fbx model')
      
      textureLoader.load('/character/shaded.png', (texture) => {
        fbxModel.traverse((child) => {
          if (child.isMesh) {
            child.material.map = texture
            child.material.needsUpdate = true
          }
        })
      })
      
      const mixer = new THREE.AnimationMixer(fbxModel)
      mixerRef.current = mixer
      
      if (fbxModel.animations.length > 0) {
        const idleAction = mixer.clipAction(fbxModel.animations[0])
        actionsRef.current.idle = idleAction
        idleAction.play()
      }
      
      fbxLoader.load('/character/walk.fbx', (walkModel) => {
        if (walkModel.animations.length > 0) {
          const walkAction = mixer.clipAction(walkModel.animations[0])
          actionsRef.current.walk = walkAction
        }
      })
      
      // Initial position and scale
      fbxModel.position.set(0, -1.8, 0)
      fbxModel.scale.set(0.01, 0.01, 0.01)
      fbxModel.rotation.y = Math.PI
      
      setModel(fbxModel)
      modelRef.current = fbxModel
    })
  }, [])
  
  // Handle floor click for movement
  const { gl, camera, scene } = useThree()
  
  useEffect(() => {
    const handleClick = (event) => {
      if ((event.button === 1 || event.button === 2) && floorMesh && modelRef.current) {
        event.preventDefault()
        
        const rect = gl.domElement.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
        
        // Transform raycaster to room's coordinate system
        const roomMatrix = new THREE.Matrix4().makeRotationY(roomRotation)
        raycaster.ray.applyMatrix4(roomMatrix)
        
        const intersects = raycaster.intersectObject(floorMesh)
        
        if (intersects.length > 0) {
          const clickPoint = intersects[0].point
          
          // Convert click point to room's coordinate system
          const roomPoint = clickPoint.clone()
          roomPoint.applyMatrix4(new THREE.Matrix4().makeRotationY(-roomRotation))
          
          // Log coordinates
          console.log('Click coordinates:', {
            world: {
              x: clickPoint.x.toFixed(2),
              y: clickPoint.y.toFixed(2),
              z: clickPoint.z.toFixed(2)
            },
            room: {
              x: roomPoint.x.toFixed(2),
              y: roomPoint.y.toFixed(2),
              z: roomPoint.z.toFixed(2)
            }
          })
          
          // Check if point is within floor bounds
          if (Math.abs(roomPoint.x) <= 5 && Math.abs(roomPoint.z) <= 5) {
            targetPositionRef.current.copy(clickPoint)
            targetPositionRef.current.y = -1.8 // Keep consistent height
            
            const direction = new THREE.Vector3().subVectors(
              targetPositionRef.current,
              modelRef.current.position
            )
            
            if (direction.length() > 0.1) {
              const angle = Math.atan2(direction.x, direction.z)
              
              if (actionsRef.current.idle && actionsRef.current.walk) {
                actionsRef.current.idle.fadeOut(0.2)
                actionsRef.current.walk.reset().fadeIn(0.2).play()
                isMovingRef.current = true
              }
            }
          }
        }
      }
    }
    
    gl.domElement.addEventListener('contextmenu', (e) => e.preventDefault())
    gl.domElement.addEventListener('mousedown', handleClick)
    
    return () => {
      gl.domElement.removeEventListener('contextmenu', (e) => e.preventDefault())
      gl.domElement.removeEventListener('mousedown', handleClick)
    }
  }, [floorMesh, gl, camera, roomRotation])
  
  // Handle target position updates
  useEffect(() => {
    const handleUpdateTargetPosition = (event) => {
      const { position } = event.detail
      if (position && modelRef.current) {
        targetPositionRef.current.copy(position)
        
        const direction = new THREE.Vector3().subVectors(
          targetPositionRef.current,
          modelRef.current.position
        )
        
        if (direction.length() > 0.1) {
          if (actionsRef.current.idle && actionsRef.current.walk) {
            actionsRef.current.idle.fadeOut(0.2)
            actionsRef.current.walk.reset().fadeIn(0.2).play()
            isMovingRef.current = true
          }
        }
      }
    }
    
    window.addEventListener('updateTargetPosition', handleUpdateTargetPosition)
    return () => window.removeEventListener('updateTargetPosition', handleUpdateTargetPosition)
  }, [])
  
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
    
    if (modelRef.current && isMovingRef.current) {
      const currentPosition = modelRef.current.position
      const direction = new THREE.Vector3().subVectors(
        targetPositionRef.current,
        currentPosition
      )
      
      if (direction.length() < 0.1) {
        isMovingRef.current = false
        
        if (actionsRef.current.idle && actionsRef.current.walk) {
          actionsRef.current.walk.fadeOut(0.2)
          actionsRef.current.idle.reset().fadeIn(0.2).play()
        }
        
        // Call onMoveComplete when movement is done
        if (onMoveComplete) {
          onMoveComplete()
        }
      } else {
        direction.normalize()
        const moveSpeed = 2.0 * delta
        currentPosition.x += direction.x * moveSpeed
        currentPosition.z += direction.z * moveSpeed
        
        modelRef.current.rotation.y = Math.atan2(direction.x, direction.z)
      }
    }
  })
  
  return model ? (
    <group rotation={[0, roomRotation, 0]}>
      <primitive object={model} ref={characterRef} />
    </group>
  ) : null
}

// Floor detection component
function FloorDetector({ onFloorDetected }) {
  const { scene } = useThree()
  
  useEffect(() => {
    if (!scene) {
      console.warn('Scene not available')
      return
    }

    console.log('Floor detector mounted, attempting to find floor...')
    
    // Function to find floor mesh
    const findFloorMesh = () => {
      // First try to find by name
      const floorByName = scene.getObjectByName('floor')
      if (floorByName) {
        console.log('Found floor by name:', floorByName)
        onFloorDetected(floorByName)
        return true
      }

      // Then try to find by traversing and checking geometry
      let foundFloor = false
      scene.traverse((object) => {
        if (!foundFloor && object.isMesh) {
          // Check if it's our floor by various characteristics
          const isLargeHorizontal = object.geometry?.parameters?.width >= 9
          const isFloorRotation = Math.abs(object.rotation.x + Math.PI/2) < 0.1
          const isFloorHeight = Math.abs(object.position.y + 2) < 0.1
          
          if (isLargeHorizontal && isFloorRotation && isFloorHeight) {
            console.log('Found floor by characteristics:', object)
            onFloorDetected(object)
            foundFloor = true
          }
        }
      })
      
      return foundFloor
    }

    // Try to find floor immediately
    if (!findFloorMesh()) {
      // If not found, try again after a short delay
      console.log('Floor not found initially, retrying...')
      const timer = setTimeout(() => {
        if (!findFloorMesh()) {
          console.warn('Failed to find floor mesh after retry')
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [scene, onFloorDetected])
  
  return null
}

// Debug helper to visualize the character position and floor
function DebugHelper({ floorMesh }) {
  const sphereRef = useRef()
  
  useFrame(() => {
    if (sphereRef.current && floorMesh) {
      // Position the helper sphere at center of floor
      sphereRef.current.position.set(0, -1.7, 0)
    }
  })
  
  return (
    <group rotation={[0, Math.PI * 0.65, 0]}>
      {/* Debug sphere to mark character spawn point */}
      <mesh ref={sphereRef} visible={true}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="red" wireframe={true} transparent={true} opacity={0.5} />
      </mesh>
    </group>
  )
}

// Either import your CSS module
// import styles from '../styles/Room.module.css'

// GLBModel component with character movement
function GLBModel({ url, position, rotation, scale, materialColor }) {
  const { scene } = useGLTF(url)
  const router = useRouter()
  const [isMoving, setIsMoving] = useState(false)
  
  // Function to move character to position before rack transition
  const moveToRack = () => {
    if (url.includes('rack1.glb') && !isMoving) {
      setIsMoving(true)
      
      // Convert target position to room's coordinate system
      const targetPos = new THREE.Vector3(-1.84, -1.90, -3.00)
      const roomRotation = Math.PI * 0.65
      targetPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), roomRotation)
      
      // Trigger character movement via global event
      const moveEvent = new CustomEvent('moveCharacter', {
        detail: {
          position: targetPos,
          onComplete: () => {
            setIsMoving(false)
            router.push('/rack')
          }
        }
      })
      window.dispatchEvent(moveEvent)
    }
  }
  
  return (
    <primitive 
      object={scene} 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onClick={moveToRack}
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
    <group rotation={[0, Math.PI * 0.65, 0]}>
      <mesh 
        position={[0, -1.9, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial 
          color="yellow" 
          wireframe={true}
          transparent={true}
          opacity={0.2}
        />
      </mesh>
    </group>
  )
}

// TV component with click handling
function TVModel({ position, rotation, scale }) {
  const router = useRouter()
  const [isMoving, setIsMoving] = useState(false)
  
  const moveToTV = () => {
    if (!isMoving) {
      setIsMoving(true)
      
      // Convert target position to room's coordinate system
      const targetPos = new THREE.Vector3(-0.62, -1.90, 3.76)
      const roomRotation = Math.PI * 0.65
      
      targetPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), roomRotation)
      
      // Trigger movement
      const moveEvent = new CustomEvent('moveCharacter', {
        detail: {
          position: targetPos,
          onComplete: () => {
            setIsMoving(false)
            router.push('/chatbot')
          }
        }
      })
      window.dispatchEvent(moveEvent)
    }
  }
  
  return (
    <group position={position} rotation={rotation} scale={scale} onClick={moveToTV}>
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
  const meshRef = useRef()
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

  useEffect(() => {
    if (meshRef.current) {
      // Set properties to make floor easily identifiable
      meshRef.current.name = 'floor'
      meshRef.current.userData.isFloor = true
      meshRef.current.userData.type = 'floor'
      
      // Ensure proper matrix updates
      meshRef.current.updateMatrix()
      meshRef.current.updateMatrixWorld(true)
      
      console.log('Floor mesh initialized:', {
        name: meshRef.current.name,
        position: meshRef.current.position,
        rotation: meshRef.current.rotation,
        userData: meshRef.current.userData
      })
    }
  }, [])

  return (
    <mesh 
      ref={meshRef}
      name="floor"
      position={[0, -2, 0]} 
      rotation={[-Math.PI / 2, 0, 0]}
      userData={{ 
        isFloor: true,
        type: 'floor'
      }}
    >
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
  const [floorMesh, setFloorMesh] = useState(null)
  const [debugMode, setDebugMode] = useState(false)
  const groupRef = useRef()
  const [moveCallback, setMoveCallback] = useState(null)
  
  // Handle character movement events
  useEffect(() => {
    const handleMoveCharacter = (event) => {
      const { position, onComplete } = event.detail
      if (position) {
        // Store the callback for when movement completes
        setMoveCallback(() => onComplete)
        // Update character target position
        window.dispatchEvent(new CustomEvent('updateTargetPosition', { 
          detail: { position } 
        }))
      }
    }
    
    window.addEventListener('moveCharacter', handleMoveCharacter)
    return () => window.removeEventListener('moveCharacter', handleMoveCharacter)
  }, [])
  
  const handleFloorDetected = useCallback((mesh) => {
    console.log('Floor detected:', mesh)
    setFloorMesh(mesh)
  }, [])
  
  useEffect(() => {
    console.log('RoomScene mounted')
    
    const handleKeyDown = (e) => {
      if (e.key === 'd') {
        setDebugMode(prev => !prev)
        console.log('Debug mode:', !debugMode)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [debugMode])

  return (
    <div className="container">
      <Header />
      
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
          <Cloud />
        </div>
        
        {debugMode && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: 10,
          borderRadius: 5,
          fontFamily: 'monospace',
          zIndex: 1000
        }}>
          <p>Floor Detected: {floorMesh ? 'Yes' : 'No'}</p>
          <p>Press 'D' to toggle debug view</p>
          <p>Middle mouse or right-click to move character</p>
        </div>
      )}
      
      <Canvas
        onCreated={({ gl, scene }) => {
          console.log('Canvas created, scene:', scene)
          scene.updateMatrixWorld(true)
        }}
      >
          <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={75} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 3, 3]} intensity={1} />
          <spotLight position={[0, 5, 0]} angle={0.5} penumbra={1} intensity={1} />

        <Suspense fallback={null}>
          {/* Floor detector component to find the floor mesh */}
          <FloorDetector onFloorDetected={handleFloorDetected} />
          
          {/* Debug helper */}
          {debugMode && floorMesh && <DebugHelper floorMesh={floorMesh} />}
          
          {/* Add the walkable area helper */}
          {debugMode && <WalkableAreaHelper />}
          
          <group 
            ref={groupRef} 
            position={[0, 0, 0]} 
            rotation={[0, Math.PI * 0.65, 0]}
            onUpdate={(self) => {
              self.updateMatrixWorld(true)
            }}
          >
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
            
            {/* Floor - IMPORTANT: This must be present for character movement */}
            <WoodFloor />
            
            {/* Character - only render when floor is detected */}
            {floorMesh && <Character floorMesh={floorMesh} onMoveComplete={moveCallback} />}
            
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
                position={[1.1, -1.95, 0]}
                rotation={[0, 0, 0]}
                scale={3}
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
              
              {/* Left curtain */}
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
          maxDistance={20}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,    // Rotate camera around target
            MIDDLE: THREE.MOUSE.PAN,     // Pan camera freely
            RIGHT: THREE.MOUSE.NONE      // Reserved for character movement
          }}
          screenSpacePanning={true}      // Enable screen space panning
          panSpeed={1.5}                 // Adjust pan speed
          target0={[0, 0, 0]}           // Initial target position
          position0={[8, 5, 8]}         // Initial camera position
          enableDamping={true}          // Smooth camera movement
          dampingFactor={0.05}          // Adjust damping strength
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