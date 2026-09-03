/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary orange scale
        orange: {
          DEFAULT: '#EE4D2D',
          primary: '#EE4D2D',
          bright: '#FF5A1F',
          hover: '#D93D1E',
          light: '#FFF1EC',
        },
        // Dark / header
        dark: {
          DEFAULT: '#080C12',
          secondary: '#101720',
        },
        navy: '#071D35',
        // Backgrounds
        bg: {
          DEFAULT: '#F5F6F8',
          secondary: '#F8F9FA',
        },
        card: '#FFFFFF',
        line: '#E5E7EB',
        // Text
        ink: {
          DEFAULT: '#111827',
          secondary: '#4B5563',
          muted: '#6B7280',
        },
        'on-dark': {
          DEFAULT: '#FFFFFF',
          secondary: '#B8C0CC',
        },
        // Status
        success: '#16A34A',
        warn: '#F59E0B',
        danger: '#DC2626',
        info: '#2563EB',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        portal: '1600px',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.08)',
        panel: '0 8px 30px rgba(0,0,0,0.12)',
      },
      fontSize: {
        label: ['11px', { lineHeight: '14px', letterSpacing: '0.06em' }],
      },
      transitionDuration: {
        200: '200ms',
      },
    },
  },
  plugins: [],
}
