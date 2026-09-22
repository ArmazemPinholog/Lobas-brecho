import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, useGLTF } from '@react-three/drei'

const OSSO = '#f2efe9'
const SANGUE = '#e12424'

/**
 * Os dois modelos vieram de fontes diferentes, cada um com sua própria
 * escala/origem — por isso cada um carrega seu próprio ajuste de posição e
 * escala pra ficar enquadrado igual dentro da mesma câmera. Os números foram
 * calculados a partir da caixa delimitadora real de cada malha (three.js
 * Box3), não chutados.
 */
const MODELOS = {
  masculino: { url: '/modelos/manequim.glb', posicao: [0, 0, 0], escala: 1 },
  feminino: { url: '/modelos/manequim-feminino.glb', posicao: [0, 0.546, 0.053], escala: 0.1319 },
}

useGLTF.preload(MODELOS.masculino.url)
useGLTF.preload(MODELOS.feminino.url)

/**
 * O corpo em si: mesma malha 3D usada em toda peça de provador, mas nunca em
 * "pele" — material fosco escuro, sem textura, sem brilho de metal. É a
 * mesma lógica de um manequim de loja física: a forma é anatômica porque
 * precisa vestir roupa de verdade, mas o acabamento opaco e sem cor de pele
 * é o que faz ela ler como manequim, não como corpo nu. Fica parado (sem
 * auto-rotação) de propósito — as fotos de roupa por cima são posicionadas
 * em x/y fixos, e um manequim girando sozinho ia descolar a roupa do corpo.
 */
function Corpo({ genero }) {
  const cfg = MODELOS[genero] || MODELOS.masculino
  const { scene } = useGLTF(cfg.url)

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

  return (
    <group position={cfg.posicao} scale={cfg.escala}>
      <primitive object={modelo} />
    </group>
  )
}

export default function ManequimScene({ genero = 'masculino' }) {
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

      {/* key força remontar ao trocar de modelo — mais simples e mais
          confiável do que tentar trocar a geometria de um grupo já montado. */}
      <Suspense fallback={null}>
        <Corpo key={genero} genero={genero} />
      </Suspense>
    </Canvas>
  )
}
