const express = require('express');
const userRouter = require('../../routes/userRouter');
const postRouter = require('../../routes/postRouter');
const chatRouter = require('../../routes/chatRouter');
const aiRouter = require('../../routes/aiRouter');

// Mock express and route handlers
jest.mock('express', () => {
  const mockRouter = {
    use: jest.fn().mockReturnThis()
  };
  return {
    Router: jest.fn(() => mockRouter)
  };
});

jest.mock('../../routes/userRouter', () => 'mock-user-router');
jest.mock('../../routes/postRouter', () => 'mock-post-router');
jest.mock('../../routes/chatRouter', () => 'mock-chat-router');
jest.mock('../../routes/aiRouter', () => 'mock-ai-router');

describe('Router Configuration', () => {
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    router = require('../../routes/index');
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should set up routes correctly', () => {
    expect(router.use).toHaveBeenCalledWith('/users', 'mock-user-router');
    expect(router.use).toHaveBeenCalledWith('/posts', 'mock-post-router');
    expect(router.use).toHaveBeenCalledWith('/chats', 'mock-chat-router');
    expect(router.use).toHaveBeenCalledWith('/ai', 'mock-ai-router');
  });
});