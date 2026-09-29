/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F14",
          900: "#111823",
          800: "#182233",
        },
        console: {
          bg: "#0B0F14",
          panel: "#111823",
          panelAlt: "#151E2B",
          line: "#22304A",
        },
        signal: {
          go: "#2FD98A",
          goDark: "#12B872",
          liaison: "#7C9CFF",
          speed: "#F5A524",
          card: "#E86FB7",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
