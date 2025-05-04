module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@components/(.*)$': '<rootDir>/src/components/$1',
      '^leaflet$': '<rootDir>/node_modules/leaflet/dist/leaflet.js',
      '^react-leaflet$': '<rootDir>/node_modules/react-leaflet/dist/react-leaflet.js',
      '^@pages/(.*)$': '<rootDir>/src/pages/$1',
      '^@context/(.*)$': '<rootDir>/src/context/$1',
      '^axios$': require.resolve('axios'),
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
      '/node_modules/(?!axios)',
      'node_modules/(?!react-leaflet|@react-leaflet|leaflet)'
    ]
  };