module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'helpers/**/*.js',
    'routes/**/*.js',
    'app.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ]
};
