/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Lobas Brechó
        sangue: '#E12424',   // vermelho da marca
        breu: '#0B0B0B',     // preto da marca
        osso: '#F2EFE9',     // off-white da marca
        prata: '#8E8E8E',    // metalizado (tom médio)
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],   // títulos massivos
        stencil: ['"Bebas Neue"', 'sans-serif'],      // labels e destaques
        corpo: ['Inter', 'system-ui', 'sans-serif'],  // textos
      },
      letterSpacing: {
        ultra: '0.42em',
      },
      transitionTimingFunction: {
        loba: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
