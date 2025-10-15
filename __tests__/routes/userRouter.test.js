const router = require('../../routes/userRouter');
const UserController = require('../../controllers/userController');
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

describe('User Router', () => {
  test('should set up routes with correct handlers', () => {
    const express = require('express');
    const mockRouter = express.Router();

    expect(mockRouter.post).toHaveBeenCalledWith('/register', UserController.register);
    expect(mockRouter.post).toHaveBeenCalledWith('/login', UserController.login);
    expect(mockRouter.post).toHaveBeenCalledWith('/auth/google', UserController.googleSignIn);
  });
});