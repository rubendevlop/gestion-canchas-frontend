/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#eef5e6',
        surface: '#f5fbee',
        surface_container_lowest: '#f5fbee',
        surface_container_low: '#eaf4de',
        surface_container: '#deeece',
        surface_container_high: '#cfe3bc',
        surface_container_highest: '#bfd5a8',
        surface_bright: '#b3cc98',
        primary: '#2f9e44',
        primary_container: '#7bcf52',
        primary_fixed: '#dff7c8',
        on_primary: '#ffffff',
        on_primary_fixed: '#0d1c0e',
        secondary: '#f2b134',
        secondary_container: '#fff0c9',
        tertiary: '#1fa38a',
        tertiary_container: '#d7f3ec',
        tertiary_fixed_dim: '#158b75',
        error: '#cf3f33',
        error_container: '#ffe1de',
        outline: '#5a7255',
        outline_variant: '#9db895',
        on_surface: '#0e1a0f',
        on_surface_variant: '#3a5238',
        on_surface_error: '#6a1711',
        inverse_surface: '#1f2d20',
        inverse_on_surface: '#f4f8ef',
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #2f9e44 0%, #6dc74b 52%, #f2d256 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
