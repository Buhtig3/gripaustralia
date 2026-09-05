/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        steel: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        theme: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          border: 'var(--border-color)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          gold: 'var(--accent-gold)',
          main: 'var(--text-main)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-display)', 'Barlow Condensed', 'Bebas Neue', 'sans-serif'],
        accent: ['var(--font-accent)', 'Space Grotesk', 'Barlow Condensed', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
