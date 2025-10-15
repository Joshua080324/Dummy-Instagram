const router = require('../../routes/chatRouter');
const ChatController = require('../../controllers/chatController');
const authMiddleware = require('../../helpers/authMiddleware');

jest.mock('express', () => {
  const mockRouter = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    use: jest.fn()
  };
  return {
    Router: jest.fn(() => mockRouter)
  };
});

describe('Chat Router', () => {
  test('should set up routes with correct handlers and middleware', () => {
    const express = require('express');
    const mockRouter = express.Router();

    expect(mockRouter.use).toHaveBeenCalledWith(authMiddleware);
    expect(mockRouter.post).toHaveBeenCalledWith('/', ChatController.createOrGetChat);
    expect(mockRouter.get).toHaveBeenCalledWith('/', ChatController.getUserChats);
    expect(mockRouter.get).toHaveBeenCalledWith('/:chatId/messages', ChatController.getChatMessages);
    expect(mockRouter.post).toHaveBeenCalledWith('/ai', ChatController.createAIChat);
    expect(mockRouter.post).toHaveBeenCalledWith('/:chatId/messages', ChatController.sendMessage);
  });
});