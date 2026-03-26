/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f7faf4',
        surface: '#ffffff',
        surface_container_lowest: '#ffffff',
        surface_container_low: '#f6faef',
        surface_container: '#eef5e5',
        surface_container_high: '#e5efda',
        surface_container_highest: '#d7e7c6',
        surface_bright: '#c9ddb3',
        primary: '#2f9e44',
        primary_container: '#7bcf52',
        primary_fixed: '#dff7c8',
        on_primary: '#ffffff',
        on_primary_fixed: '#132414',
        secondary: '#f2b134',
        secondary_container: '#fff0c9',
        tertiary: '#1fa38a',
        tertiary_container: '#d7f3ec',
        tertiary_fixed_dim: '#158b75',
        error: '#cf3f33',
        error_container: '#ffe1de',
        outline: '#7a8d75',
        outline_variant: '#bfd0b9',
        on_surface: '#182418',
        on_surface_variant: '#536553',
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
