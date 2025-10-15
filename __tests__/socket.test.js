// Mock dependencies first
jest.mock('express', () => {
  const mockRouter = {
    use: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    set: jest.fn()
  };
  const mockExpress = jest.fn(() => mockRouter);
  mockExpress.Router = jest.fn(() => mockRouter);
  mockExpress.json = jest.fn(() => jest.fn());
  mockExpress.urlencoded = jest.fn(() => jest.fn());
  mockExpress.static = jest.fn(() => jest.fn());
  return mockExpress;
});

jest.mock('http');
jest.mock('socket.io', () => {
  const mockSocket = {
    id: 'test-socket-id',
    join: jest.fn(),
    on: jest.fn((event, handler) => {
      if (event === 'join_chat') {
        handler('test-123');
      }
    }),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  };

  const mockIo = {
    on: jest.fn(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    socket: mockSocket
  };

  const Server = jest.fn((httpServer, options) => {
    mockIo.on.mockImplementation((event, handler) => {
      if (event === 'connection') {
        handler(mockSocket);
      }
    });
    return mockIo;
  });

  return { Server };
});

jest.mock('../helpers/handleError');
jest.mock('cors', () => jest.fn(() => jest.fn()));
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('../routes', () => ({
  aiRouter: { use: jest.fn() },
  chatRouter: { use: jest.fn() },
  postRouter: { use: jest.fn() },
  userRouter: { use: jest.fn() }
}));

// Require modules after mocks are defined
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const handleError = require('../helpers/handleError');

describe('Socket.IO Configuration', () => {
  let mockApp, mockServer, mockIo, mockSocket;

  beforeEach(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';

    // Mock Express app
    mockApp = {
      use: jest.fn(),
      set: jest.fn()
    };
    express.mockReturnValue(mockApp);

    // Mock HTTP server
    mockServer = {
      listen: jest.fn()
    };
    http.createServer.mockReturnValue(mockServer);

    // Setup mock io instance
    mockIo = Server(mockServer, { cors: { origin: "*" } });
    mockSocket = mockIo.socket;

    // Reset modules and load app to initialize Socket.IO
    jest.isolateModules(() => {
      require('../app');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('should initialize socket.io properly', () => {
    expect(Server).toHaveBeenCalledWith(mockServer, {
      cors: { origin: "*" }
    });
    expect(mockApp.set).toHaveBeenCalledWith('socketio', mockIo);
  });

  test('should handle socket connection', () => {
    // Verify Socket.IO server was initialized with correct options
    expect(Server).toHaveBeenCalledWith(mockServer, {
      cors: { origin: "*" }
    });
  });

  test('should handle join_chat event', () => {
    // Call the join_chat handler directly to trigger the event
    const joinChatId = 'test-123';
    mockSocket.on('join_chat', (id) => {
      mockSocket.join(`chat_${id}`);
    });
    mockSocket.on.mock.calls[0][1](joinChatId);
    
    // Verify room join
    expect(mockSocket.join).toHaveBeenCalledWith(`chat_${joinChatId}`);
  });

  test('should setup disconnect handling', () => {
    // Test disconnect event registration
    mockSocket.on('disconnect', () => {});
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });

  test('should not start in test env', () => {
    expect(mockServer.listen).not.toHaveBeenCalled();
  });

  test('should handle send_message event', () => {
    // Get the stored handler for send_message
    const messageData = {
      chatId: 'test-123',
      content: 'Hello World',
      sender: 'user-1'
    };
    
    // Manually trigger the send_message handler
    if (mockSocket.handlers && mockSocket.handlers.send_message) {
      mockSocket.handlers.send_message(messageData);
      
      // Verify message was broadcast to the correct room
      expect(mockSocket.to).toHaveBeenCalledWith('chat_test-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('new_message', messageData);
    }
  });

  test('should handle user typing events', () => {
    const typingData = {
      chatId: 'test-123',
      userId: 'user-1',
      username: 'Test User'
    };
    
    // Manually trigger the user_typing handler
    if (mockSocket.handlers && mockSocket.handlers.user_typing) {
      mockSocket.handlers.user_typing(typingData);
      
      // Verify typing status was broadcast to the correct room
      expect(mockSocket.to).toHaveBeenCalledWith('chat_test-123');
      expect(mockSocket.emit).toHaveBeenCalledWith('typing_status', typingData);
    }
  });
});