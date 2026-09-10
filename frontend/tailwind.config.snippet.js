/**
 * Merge this into the `theme.extend` of your existing tailwind.config.js.
 * Nothing here needs a separate CSS file — it's pure Tailwind theming.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        midnight: "#0f0a0d",
        velvet: "#2a1018",
        wine: { DEFAULT: "#7a1f3d", bright: "#a52d52" },
        gold: "#c9a24b",
        ivory: "#f2e9dc",
        smoke: "#8a7680",
      },
      fontFamily: {
        display: ['"Fraunces"', '"Playfair Display"', "Georgia", "serif"],
      },
      backgroundImage: {
        "scene-glow":
          "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(122,31,61,0.14), transparent 60%)",
        "gold-sweep":
          "linear-gradient(100deg, #c9a24b 20%, #f2e9dc 45%, #c9a24b 70%)",
        "wine-btn": "linear-gradient(160deg, #a52d52, #7a1f3d 70%)",
        "vinyl-badge":
          "repeating-radial-gradient(circle at center, #2a1018 0 2px, #1c0a10 2px 4px)",
        "curtain-fabric":
          "linear-gradient(120deg, #7a1f3d 0%, #4a1226 60%, #0f0a0d 100%)",
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        sweep: "200% 100%",
      },
      keyframes: {
        grainShift: {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(-1%,1%)" },
        },
        goldSweep: {
          from: { backgroundPosition: "100% 0" },
          to: { backgroundPosition: "0% 0" },
        },
        curtainLeft: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        curtainRight: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        revealFade: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      animation: {
        grain: "grainShift 8s steps(8) infinite",
        "gold-sweep": "goldSweep 2.2s ease-out 1",
        "curtain-left": "curtainLeft 0.9s cubic-bezier(0.65,0,0.35,1) forwards",
        "curtain-right": "curtainRight 0.9s cubic-bezier(0.65,0,0.35,1) forwards",
        "reveal-fade": "revealFade 0.6s ease-out 0.7s forwards",
      },
    },
  },
};
