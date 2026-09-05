export default {
  plugins: {
    '@stylexswc/postcss-plugin': {
      include: [
        'src/app/**/*.{js,jsx,ts,tsx}',
        'src/components/**/*.{js,jsx,ts,tsx}',
      ],
      rsOptions: {
        dev: process.env.NODE_ENV === 'development',
      },
    },
  },
}
