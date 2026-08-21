/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Application surfaces — driven by CSS variables so they flip with the
        // active theme (see :root / .dark blocks in index.css).
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        // Dark navy sidebar / command surfaces
        navy: {
          950: '#0A0F1C',
          900: '#0E1524',
          850: '#131C30',
          800: '#18233B',
          700: '#22304F',
          600: '#2E4064',
          500: '#3D5480',
          400: '#64789C',
          300: '#94A3B8',
        },
        ink: {
          900: 'rgb(var(--c-ink-900) / <alpha-value>)',
          700: 'rgb(var(--c-ink-700) / <alpha-value>)',
          500: 'rgb(var(--c-ink-500) / <alpha-value>)',
          400: 'rgb(var(--c-ink-400) / <alpha-value>)',
          300: 'rgb(var(--c-ink-300) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
          soft: 'rgb(var(--c-line-soft) / <alpha-value>)',
          strong: 'rgb(var(--c-line-strong) / <alpha-value>)',
        },
        brand: {
          50: 'rgb(var(--c-brand-50) / <alpha-value>)',
          100: 'rgb(var(--c-brand-100) / <alpha-value>)',
          200: 'rgb(var(--c-brand-200) / <alpha-value>)',
          300: 'rgb(var(--c-brand-300) / <alpha-value>)',
          400: 'rgb(var(--c-brand-400) / <alpha-value>)',
          500: 'rgb(var(--c-brand-500) / <alpha-value>)',
          600: 'rgb(var(--c-brand-600) / <alpha-value>)',
          700: 'rgb(var(--c-brand-700) / <alpha-value>)',
          800: 'rgb(var(--c-brand-800) / <alpha-value>)',
        },
        // Status semantics
        ok: {
          50: '#E9F9EF',
          100: '#CFF1DB',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534',
        },
        warn: {
          50: '#FEF6E7',
          100: '#FCEBC6',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        danger: {
          50: '#FDECEC',
          100: '#FAD4D4',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
        },
        info: {
          50: '#E9F1FE',
          100: '#CFE0FC',
          500: '#2563EB',
          600: '#1D4ED8',
        },
        neutralst: {
          50: 'rgb(var(--c-neutralst-50) / <alpha-value>)',
          100: 'rgb(var(--c-neutralst-100) / <alpha-value>)',
          500: 'rgb(var(--c-neutralst-500) / <alpha-value>)',
          600: 'rgb(var(--c-neutralst-600) / <alpha-value>)',
        },
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.95rem' }],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)',
        'card-hover': '0 4px 12px -2px rgba(15,23,42,0.10), 0 2px 6px -2px rgba(15,23,42,0.06)',
        pop: '0 8px 28px -6px rgba(15,23,42,0.18), 0 2px 8px -2px rgba(15,23,42,0.10)',
        rail: '1px 0 0 0 rgba(255,255,255,0.04)',
      },
      borderRadius: {
        card: '10px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        // Login stage — floating soundbox devices + audio motion
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'float-sm': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.65)', opacity: '0.5' },
          '100%': { transform: 'scale(2.3)', opacity: '0' },
        },
        eq: {
          '0%,100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'drift-up': {
          '0%': { transform: 'translateY(18px)', opacity: '0' },
          '12%,80%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-18px)', opacity: '0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'slide-in': 'slide-in 0.22s cubic-bezier(0.16,1,0.3,1)',
        float: 'float 6s ease-in-out infinite',
        'float-sm': 'float-sm 5s ease-in-out infinite',
        ripple: 'ripple 3s ease-out infinite',
        eq: 'eq 1.1s ease-in-out infinite',
        'drift-up': 'drift-up 5.5s ease-in-out infinite',
        'spin-slow': 'spin-slow 44s linear infinite',
      },
    },
  },
  plugins: [],
};
