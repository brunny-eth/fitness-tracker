/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#3B82F6',  // Blue
          success: '#22C55E',  // Green
          warning: '#F59E0B',  // Yellow
          error: '#EF4444',    // Red
        },
      },
    },
    plugins: [],
  }