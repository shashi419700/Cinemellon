/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0D",
        surface: "#121212",
        "surface-raised": "#191919",
        "surface-line": "#2A2A2A",
        coral: "#FF6B6B",
        clay: "#FF8E72",
        bone: "#FFFFFF",
        muted: "#A6A6AA",
        faint: "#6E6E73",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "coral-glow": "linear-gradient(135deg, #2A1414 0%, #7A2A22 45%, #FF6B6B 100%)",
        "coral-cta": "linear-gradient(135deg, #FF6B6B 0%, #FF8E72 100%)",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,0.35)",
        glow: "0 0 40px rgba(255,107,107,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
