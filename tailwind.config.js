/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        school: {
          primary: '#004ac6',
          'primary-light': '#2563eb',
          'primary-hover': '#003ea8',
          'primary-container': '#dbe1ff',
          secondary: '#006c49',
          'secondary-light': '#10b981',
          'secondary-container': '#6cf8bb',
          tertiary: '#784b00',
          'tertiary-light': '#f59e0b',
          'tertiary-container': '#ffeedd',
          error: '#ba1a1a',
          'error-light': '#ef4444',
          'error-container': '#ffdad6',
          background: '#f8f9ff',
          'bg-soft': '#f0f4ff',
          card: '#ffffff',
          'card-hover': '#fafcff',
          surface: '#f8f9ff',
          'surface-container': '#e5eeff',
          'surface-container-high': '#dce9ff',
          'surface-container-highest': '#d3e4fe',
          'text-main': '#0b1c30',
          'text-muted': '#434655',
          border: '#c3c6d7',
          'border-light': '#e2e8f0',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'Be Vietnam Pro', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 74, 198, 0.06), 0 2px 6px -1px rgba(0, 74, 198, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(0, 74, 198, 0.1), 0 4px 12px -2px rgba(0, 74, 198, 0.05)',
        'card': '0 2px 12px 0 rgba(11, 28, 48, 0.04)',
      },
      borderRadius: {
        'card': '1rem',
        'input': '0.75rem',
      }
    },
  },
  plugins: [],
}
