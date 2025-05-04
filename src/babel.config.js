// babel.config.js
export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
  ],
  plugins: [
    // Add any necessary plugins (e.g., for styled-components, etc.)
  ],
};