/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#101710',
        surface: '#121b13',
        surface_container_lowest: '#0b110c',
        surface_container_low: '#142016',
        surface_container: '#1a271c',
        surface_container_high: '#253627',
        surface_container_highest: '#314835',
        surface_bright: '#425c47',
        primary: '#9ef06b',
        primary_container: '#2fac4c',
        primary_fixed: '#ddffbd',
        on_primary: '#0a210d',
        on_primary_fixed: '#071309',
        secondary: '#ffc857',
        secondary_container: '#4a3511',
        tertiary: '#66d7b3',
        tertiary_container: '#123b30',
        tertiary_fixed_dim: '#47c49d',
        error: '#ff9088',
        error_container: '#5f1010',
        outline: '#94a58f',
        outline_variant: '#4a5d4c',
        on_surface: '#edf3e9',
        on_surface_variant: '#c4d0c1',
        on_surface_error: '#ffd8d5',
        inverse_surface: '#edf3e9',
        inverse_on_surface: '#203024',
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #1a8f43 0%, #4bc95b 48%, #9ef06b 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
