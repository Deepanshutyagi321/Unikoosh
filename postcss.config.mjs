// Stays JS on purpose: postcss-load-config (which reads this file) doesn't
// support .ts natively. Everything else in this project is TypeScript.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
