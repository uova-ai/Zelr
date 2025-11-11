cat > tailwind.config.js <<'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0B10",
        indigoZ: "#1a1f3b",
        accentZ: "#5b7cfa",
        card: "#11131a",
      },
      boxShadow: { soft: "0 10px 30px rgba(0,0,0,0.3)" },
    },
  },
  plugins: [],
};
EOF