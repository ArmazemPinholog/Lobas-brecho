import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, useGLTF } from '@react-three/drei'

const OSSO = '#f2efe9'
const SANGUE = '#e12424'

useGLTF.preload('/modelos/manequim.glb')

/**
 * O corpo em si: mesma malha 3D usada em toda peça de provador, mas nunca em
 * "pele" — material fosco escuro, sem textura, sem brilho de metal. É a
 * mesma lógica de um manequim de loja física: a forma é anatômica porque
 * precisa vestir roupa de verdade, mas o acabamento opaco e sem cor de pele
 * é o que faz ela ler como manequim, não como corpo nu. Fica parado (sem
 * auto-rotação) de propósito — as fotos de roupa por cima são posicionadas
 * em x/y fixos, e um manequim girando sozinho ia descolar a roupa do corpo.
 */
function Corpo() {
  const { scene } = useGLTF('/modelos/manequim.glb')

  const modelo = useMemo(() => {
    const clone = scene.clone(true)
    const material = new THREE.MeshStandardMaterial({
      color: '#151515',
      roughness: 0.85,
      metalness: 0.12,
    })
    clone.traverse((obj) => {
      if (obj.isMesh) obj.material = material
    })
    return clone
  }, [scene])

  return <primitive object={modelo} />
}

export default function ManequimScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 3.6]} fov={35} />

      <ambientLight intensity={1.05} />
      <directionalLight position={[2, 3, 4]} intensity={2.8} color={OSSO} />
      <directionalLight position={[-2.5, 0.5, -1.5]} intensity={1.5} color={SANGUE} />
      <directionalLight position={[0, -2, 3]} intensity={0.6} color={OSSO} />

      <Suspense fallback={null}>
        <Corpo />
      </Suspense>
    </Canvas>
  )
}
