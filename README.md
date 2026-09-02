# Lobas Brechó — interface

Vitrine imersiva para brechó curado. React + Tailwind, com R3F na hero, GSAP/ScrollTrigger na
rolagem, Framer Motion nas microinterações e Lenis na rolagem contínua.

## Rodar

```bash
npm install
npm run dev
```

Build de produção: `npm run build` → `dist/`.

## Estrutura

```
src/
├─ App.jsx                  # shell: grain, cursor, ordem das seções
├─ hooks/
│  ├─ useSmoothScroll.js    # Lenis dirigido pelo ticker do GSAP
│  └─ useMagnetic.js        # atração magnética com spring
├─ three/
│  ├─ geometries.js         # estrela extrudada + cabide de arame (merge manual)
│  └─ HeroScene.jsx         # canvas, luz que segue o cursor, inclinação com inércia
├─ components/
│  ├─ Hero.jsx              # timeline única de entrada (máscaras de linha)
│  ├─ Vitrine.jsx           # bento assimétrico 12 colunas
│  ├─ CardProduto.jsx       # paralaxe por scrub + zoom fluido
│  ├─ ModalProduto.jsx      # ficha da peça, spring + Esc + trava de scroll
│  ├─ Manifesto.jsx         # revelação linha a linha
│  ├─ Faixa.jsx / Rodape.jsx / Navegacao.jsx / CursorEstrela.jsx / BotaoMagnetico.jsx
└─ data/products.js         # acervo (campo `peso` define a área no bento)
```

## Decisões

- **Paleta fechada na marca:** `#E12424` (sangue), `#0B0B0B` (breu), `#F2EFE9` (osso) e um gradiente
  metalizado usado só no recorte de texto (`.risco-metal`).
- **Tipografia:** Anton para os títulos massivos (peso condensado do logo), Bebas Neue para rótulos
  espaçados, Inter para leitura.
- **Sem fotos de produto:** os cards usam gradientes radiais derivados da cor real da peça. Trocar
  por `<img>` é direto: substitua a div de fundo dentro de `CardProduto.jsx` mantendo o `ref={tecido}`
  no elemento que recebe a paralaxe.
- **Acessibilidade:** foco visível, `prefers-reduced-motion` desliga Lenis e animações, cursor custom
  só aparece em ponteiro fino, modal com `role="dialog"` e fechamento por Esc.
- **Assets da marca** ficam em `public/brand/` (pata, barcode, pincelada, logo).
