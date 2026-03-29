/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffffff',
        accent: '#00ff00',
        'accent-dark': '#06ff46',
        'accent-light': '#3bff0f',
        'text-dark': '#1a1a1a',
        'text-light': '#666666',
        'text-muted': '#888888',
        'bg-white': '#ffffff',
        'bg-off-white': '#fafafa',
        border: '#e5e5e5',
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        pixel: ['Jersey 20', 'cursive'],
      },
      maxWidth: {
        container: '1400px',
      },
      spacing: {
        '2xs': '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        full: '999px',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
        md: '0 4px 12px rgba(0, 0, 0, 0.1)',
        lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
