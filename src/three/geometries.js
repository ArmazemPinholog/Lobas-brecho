import * as THREE from 'three'

/**
 * Estrela de 4 pontas da marca, em volume.
 * As curvas quadráticas puxam as laterais para perto do centro (controle em ±pinch),
 * o que cria as pontas finas e côncavas do símbolo original.
 */
export function criarEstrelaGeometry({ raio = 1, pinch = 0.1, profundidade = 0.12 } = {}) {
  const shape = new THREE.Shape()
  const r = raio
  const p = pinch * raio

  shape.moveTo(0, r)
  shape.quadraticCurveTo(p, p, r, 0)
  shape.quadraticCurveTo(p, -p, 0, -r)
  shape.quadraticCurveTo(-p, -p, -r, 0)
  shape.quadraticCurveTo(-p, p, 0, r)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: profundidade,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 48,
  })
  geo.center()
  return geo
}

/**
 * Cabide de arame montado por partes: gancho (arco de torus),
 * ombros (dois cilindros inclinados) e barra inferior.
 * Devolve uma BufferGeometry única para não pagar 4 draw calls por cabide.
 */
export function criarCabideGeometry({ espessura = 0.022 } = {}) {
  const partes = []

  const gancho = new THREE.TorusGeometry(0.16, espessura, 10, 48, Math.PI * 1.55)
  gancho.rotateZ(Math.PI * 0.28)
  gancho.translate(0, 0.62, 0)
  partes.push(gancho)

  const barra = new THREE.CylinderGeometry(espessura, espessura, 1.24, 10)
  barra.rotateZ(Math.PI / 2)
  barra.translate(0, -0.34, 0)
  partes.push(barra)

  const ombroEsq = new THREE.CylinderGeometry(espessura, espessura, 0.78, 10)
  ombroEsq.rotateZ(Math.PI / 2.42)
  ombroEsq.translate(-0.31, -0.1, 0)
  partes.push(ombroEsq)

  const ombroDir = ombroEsq.clone()
  ombroDir.rotateZ(-Math.PI / 1.21)
  ombroDir.translate(0.62, 0, 0)
  partes.push(ombroDir)

  const merged = mesclar(partes)
  merged.center()
  return merged
}

/** Mescla manual de BufferGeometries não-indexadas (evita dependência extra). */
function mesclar(geometrias) {
  const posicoes = []
  const normais = []
  for (const g of geometrias) {
    const nao = g.index ? g.toNonIndexed() : g
    posicoes.push(nao.attributes.position.array)
    normais.push(nao.attributes.normal.array)
    if (nao !== g) nao.dispose()
    g.dispose()
  }
  const total = posicoes.reduce((soma, a) => soma + a.length, 0)
  const pos = new Float32Array(total)
  const nor = new Float32Array(total)
  let offset = 0
  posicoes.forEach((a, i) => {
    pos.set(a, offset)
    nor.set(normais[i], offset)
    offset += a.length
  })
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
  return out
}
