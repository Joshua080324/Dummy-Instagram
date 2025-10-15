// 🧪 app.test.js — clean version
jest.mock('express');
jest.mock('cors');
jest.mock('morgan');
jest.mock('socket.io');
jest.mock('../helpers/handleError');
jest.mock('../routes');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const http = require('http');
const handleError = require('../helpers/handleError');
const routes = require('../routes');

describe('App Configuration', () => {
  let mockApp;
  let mockServer;
  let mockIo;

  beforeEach(() => {
    mockApp = {
      use: jest.fn(),
      set: jest.fn(),
    };

    express.mockReturnValue(mockApp);
    cors.mockReturnValue('cors middleware');
    morgan.mockReturnValue('morgan middleware');

    mockServer = { listen: jest.fn() };
    http.createServer = jest.fn().mockReturnValue(mockServer);

    const mockOn = jest.fn();
    mockIo = { on: mockOn };
    Server.mockImplementation(() => mockIo);

    jest.isolateModules(() => {
      require('../app');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

test('should set up middleware correctly', () => {
  expect(mockApp.use).toHaveBeenCalledWith('cors middleware');
  expect(mockApp.use).toHaveBeenCalledWith('json middleware');
  expect(mockApp.use).toHaveBeenCalledWith('urlencoded middleware');
  expect(mockApp.use).toHaveBeenCalledWith('static middleware');
  expect(mockApp.use).toHaveBeenCalledWith('/', routes); 
  expect(mockApp.use).toHaveBeenCalledWith(handleError);
});


  test('should set up socket.io', () => {
    expect(mockApp.set).toHaveBeenCalledWith('socketio', mockIo);
  });

  test('should register socket.io event handlers', () => {
    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));

    const connectionHandler = mockIo.on.mock.calls.find(call => call[0] === 'connection')[1];
    const mockSocket = { on: jest.fn(), join: jest.fn() };
    connectionHandler(mockSocket);

    expect(mockSocket.on).toHaveBeenCalledWith('join_chat', expect.any(Function));
    const joinHandler = mockSocket.on.mock.calls.find(call => call[0] === 'join_chat')[1];
    joinHandler('abc');
    expect(mockSocket.join).toHaveBeenCalledWith('chat_abc');
  });

  test('should not start server if in test environment', () => {
    process.env.NODE_ENV = 'test';
    expect(mockServer.listen).not.toHaveBeenCalled();
  });
});
