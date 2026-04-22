const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;
const brandWhite = withOpacity('--text-white-rgb');
const brandBg = withOpacity('--bg-main-rgb');
const brandPrimary = withOpacity('--primary-green-rgb');
const brandPrimaryHover = withOpacity('--primary-green-hover-rgb');
const brandGray = withOpacity('--light-gray-rgb');

const neutralScale = {
  50: brandWhite,
  100: brandWhite,
  200: brandWhite,
  300: brandGray,
  400: brandGray,
  500: brandGray,
  600: brandBg,
  700: brandBg,
  800: brandBg,
  900: brandBg,
  950: brandBg,
};

const accentScale = {
  50: brandWhite,
  100: brandWhite,
  200: brandGray,
  300: brandPrimaryHover,
  400: brandPrimary,
  500: brandPrimary,
  600: brandPrimaryHover,
  700: brandPrimary,
  800: brandBg,
  900: brandBg,
  950: brandBg,
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: brandWhite,
        black: brandBg,
        slate: neutralScale,
        gray: neutralScale,
        zinc: neutralScale,
        neutral: neutralScale,
        stone: neutralScale,
        red: accentScale,
        orange: accentScale,
        amber: accentScale,
        yellow: accentScale,
        lime: accentScale,
        green: accentScale,
        emerald: accentScale,
        teal: accentScale,
        cyan: accentScale,
        sky: accentScale,
        blue: accentScale,
        indigo: accentScale,
        violet: accentScale,
        purple: accentScale,
        fuchsia: accentScale,
        pink: accentScale,
        rose: accentScale,
        background: withOpacity('--background-rgb'),
        surface: withOpacity('--surface-rgb'),
        surface_container_lowest: withOpacity('--surface-container-lowest-rgb'),
        surface_container_low: withOpacity('--surface-container-low-rgb'),
        surface_container: withOpacity('--surface-container-rgb'),
        surface_container_high: withOpacity('--surface-container-high-rgb'),
        surface_container_highest: withOpacity('--surface-container-highest-rgb'),
        surface_bright: withOpacity('--surface-container-lowest-rgb'),
        primary: withOpacity('--primary-green-rgb'),
        primary_container: withOpacity('--primary-green-hover-rgb'),
        primary_fixed: withOpacity('--primary-green-rgb'),
        on_primary: withOpacity('--bg-main-rgb'),
        on_primary_fixed: withOpacity('--bg-main-rgb'),
        secondary: withOpacity('--bg-main-rgb'),
        secondary_container: withOpacity('--secondary-container-rgb'),
        tertiary: withOpacity('--tertiary-rgb'),
        tertiary_container: withOpacity('--tertiary-container-rgb'),
        tertiary_fixed_dim: withOpacity('--outline-rgb'),
        error: withOpacity('--primary-green-rgb'),
        error_container: withOpacity('--light-gray-rgb'),
        outline: withOpacity('--outline-rgb'),
        outline_variant: withOpacity('--light-gray-rgb'),
        on_surface: withOpacity('--on-surface-rgb'),
        on_surface_variant: withOpacity('--on-surface-variant-rgb'),
        on_surface_error: withOpacity('--bg-main-rgb'),
        inverse_surface: withOpacity('--inverse-surface-rgb'),
        inverse_on_surface: withOpacity('--inverse-on-surface-rgb'),
        brand_bg: withOpacity('--bg-main-rgb'),
        brand_green: withOpacity('--primary-green-rgb'),
        brand_green_hover: withOpacity('--primary-green-hover-rgb'),
        brand_white: withOpacity('--text-white-rgb'),
        brand_gray: withOpacity('--light-gray-rgb'),
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, rgb(var(--primary-green-rgb)) 0%, rgb(var(--primary-green-hover-rgb)) 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
