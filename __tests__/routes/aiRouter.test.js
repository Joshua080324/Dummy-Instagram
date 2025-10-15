const express = require('express');
const AIController = require('../../controllers/aiController');
const authMiddleware = require('../../helpers/authMiddleware');

jest.mock('express', () => {
  const mockRouter = {
    get: jest.fn().mockReturnThis(),
    use: jest.fn().mockReturnThis()
  };
  return {
    Router: jest.fn(() => mockRouter)
  };
});

jest.mock('../../controllers/aiController');
jest.mock('../../helpers/authMiddleware');

describe('AI Router', () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = express.Router();
    jest.clearAllMocks();
  });

  test('should set up routes with correct handlers and middleware', () => {
    require('../../routes/aiRouter');

    // Verify middleware
    expect(mockRouter.get).toHaveBeenCalledWith(
      '/recommendations',
      authMiddleware,
      AIController.getRecommendations
    );
  });
});