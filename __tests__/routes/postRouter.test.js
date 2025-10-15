const express = require('express');
const PostController = require('../../controllers/postController');
const auth = require('../../helpers/authMiddleware');
const upload = require('../../helpers/cloudinary');

// Mock external dependencies
jest.mock('express', () => {
  const mockRouter = {
    post: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    use: jest.fn().mockReturnThis(),
  };
  return {
    Router: jest.fn(() => mockRouter),
  };
});

jest.mock('../../controllers/postController');
jest.mock('../../helpers/authMiddleware');
jest.mock('../../helpers/cloudinary', () => ({
  array: jest.fn().mockReturnValue('mock-upload-middleware')
}));

describe('Post Router', () => {
  let router;

  beforeEach(() => {
    jest.clearAllMocks();
    upload.array.mockReturnValue('mock-upload-middleware');
    router = require('../../routes/postRouter');
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('should set up routes with correct handlers and middleware', () => {
    expect(router.post).toHaveBeenCalledWith('/', auth, 'mock-upload-middleware', PostController.createPost);
    expect(router.get).toHaveBeenCalledWith('/', PostController.getAllPublicPosts);
    expect(router.get).toHaveBeenCalledWith('/me', auth, PostController.getMyPosts);
    expect(router.put).toHaveBeenCalledWith('/:id', auth, PostController.updatePost);
    expect(router.delete).toHaveBeenCalledWith('/:id', auth, PostController.deletePost);
    expect(router.post).toHaveBeenCalledWith('/:id/like', auth, PostController.toggleLike);

    expect(upload.array).toHaveBeenCalledWith('images', 5);
  });
});