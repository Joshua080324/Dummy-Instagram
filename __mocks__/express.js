// __mocks__/express.js
const mockRouter = {
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

const express = jest.fn(() => ({
  use: jest.fn(),
  set: jest.fn(),
}));

express.Router = jest.fn(() => mockRouter);
express.json = jest.fn(() => 'json middleware');
express.urlencoded = jest.fn(() => 'urlencoded middleware');
express.static = jest.fn(() => 'static middleware');

module.exports = express;
