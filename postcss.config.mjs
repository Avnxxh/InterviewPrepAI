import animatePlugin from 'tailwindcss-animate';

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      plugins: {
        "tailwindcss-animate": animatePlugin,
      },
    },
  },
};

export default config;
