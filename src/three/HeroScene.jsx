import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, PerspectiveCamera, RoundedBox, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import { criarEstrelaGeometry, criarCabideGeometry } from './geometries'

const SANGUE = '#e12424'
const OSSO = '#f2efe9'

/** Estrela central: metal escovado com núcleo emissivo vermelho. */
function Estrela(props) {
  const geo = useMemo(() => criarEstrelaGeometry({ raio: 1.35, pinch: 0.09, profundidade: 0.16 }), [])
  const ref = useRef()

  useFrame((state, delta) => {
    // Giro lento e constante: a estrela é o único elemento que nunca para.
    ref.current.rotation.z += delta * 0.12
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.35
  })

  return (
    <mesh ref={ref} geometry={geo} castShadow {...props}>
      <meshStandardMaterial
        color={SANGUE}
        emissive={SANGUE}
        emissiveIntensity={0.55}
        metalness={0.85}
        roughness={0.22}
      />
    </mesh>
  )
}

/** Cabides de arame flutuando em profundidades diferentes. */
function Cabide({ posicao, escala = 1, rotacao = 0, velocidade = 1 }) {
  const geo = useMemo(() => criarCabideGeometry(), [])
  const ref = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime * velocidade
    ref.current.rotation.z = rotacao + Math.sin(t * 0.6) * 0.12
    ref.current.rotation.y = Math.sin(t * 0.4) * 0.5
  })

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.9}>
      <mesh ref={ref} geometry={geo} position={posicao} scale={escala} castShadow>
        <meshStandardMaterial color={OSSO} metalness={1} roughness={0.28} envMapIntensity={0.8} />
      </mesh>
    </Float>
  )
}

/** Etiquetas de preço: placas finas com furo, em preto fosco e vermelho. */
function Etiqueta({ posicao, cor = '#141414', rotacao = [0, 0, 0.4], escala = 1 }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8 + posicao[0]) * 0.6
  })

  return (
    <Float speed={1.1} rotationIntensity={0.4} floatIntensity={1.2}>
      <group ref={ref} position={posicao} rotation={rotacao} scale={escala}>
        <RoundedBox args={[0.5, 0.8, 0.045]} radius={0.06} smoothness={4} castShadow>
          <meshStandardMaterial color={cor} metalness={0.35} roughness={0.55} />
        </RoundedBox>
        {/* Ilhós da etiqueta */}
        <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.055, 0.018, 8, 24]} />
          <meshStandardMaterial color={OSSO} metalness={1} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  )
}

/**
 * Inclina o conjunto inteiro na direção do ponteiro.
 * O lerp mantém o movimento com inércia — sem isso a cena "gruda" no mouse
 * e o resultado parece um widget, não um objeto com massa.
 */
function ConjuntoInterativo({ children }) {
  const grupo = useRef()
  const alvo = useRef(new THREE.Vector2())

  useFrame((state, delta) => {
    alvo.current.set(state.pointer.x, state.pointer.y)
    const fator = 1 - Math.pow(0.001, delta) // lerp independente de framerate
    grupo.current.rotation.y += (alvo.current.x * 0.42 - grupo.current.rotation.y) * fator
    grupo.current.rotation.x += (-alvo.current.y * 0.3 - grupo.current.rotation.x) * fator
    grupo.current.position.x += (alvo.current.x * 0.35 - grupo.current.position.x) * fator
    grupo.current.position.y += (alvo.current.y * 0.22 - grupo.current.position.y) * fator
  })

  return <group ref={grupo}>{children}</group>
}

/** Luz principal que acompanha o cursor, criando o brilho direcional pedido. */
function LuzDoCursor() {
  const luz = useRef()
  const { viewport } = useThree()

  useFrame((state, delta) => {
    const fator = 1 - Math.pow(0.002, delta)
    const alvoX = state.pointer.x * viewport.width * 0.6
    const alvoY = state.pointer.y * viewport.height * 0.6
    luz.current.position.x += (alvoX - luz.current.position.x) * fator
    luz.current.position.y += (alvoY - luz.current.position.y) * fator
  })

  return <pointLight ref={luz} position={[3, 2, 4]} intensity={38} distance={18} color={OSSO} />
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <AdaptiveDpr pixelated />
      <PerspectiveCamera makeDefault position={[0, 0, 6.5]} fov={42} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 5, 3]} intensity={1.1} color={OSSO} />
      <pointLight position={[-3, -2, -2]} intensity={22} color={SANGUE} distance={14} />
      <LuzDoCursor />

      <ConjuntoInterativo>
        <Estrela position={[0.1, 0.15, 0]} />
        <Cabide posicao={[-2.5, 0.9, -1.2]} escala={1.15} rotacao={-0.25} velocidade={0.9} />
        <Cabide posicao={[2.45, -0.4, -0.8]} escala={0.95} rotacao={0.32} velocidade={1.2} />
        <Cabide posicao={[1.5, 1.5, -2.4]} escala={0.7} rotacao={0.1} velocidade={0.7} />
        <Etiqueta posicao={[-1.6, -1.35, 0.4]} cor="#141414" escala={1.1} />
        <Etiqueta posicao={[2.05, 1.25, -0.2]} cor={SANGUE} rotacao={[0, 0, -0.35]} escala={0.85} />
        <Etiqueta posicao={[-2.9, -0.6, -1.8]} cor="#1f1f1f" rotacao={[0, 0, 0.9]} escala={0.75} />
      </ConjuntoInterativo>
    </Canvas>
  )
}
