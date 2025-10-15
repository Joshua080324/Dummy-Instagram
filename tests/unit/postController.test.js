// __tests__/postController.test.js
const PostController = require('../../controllers/postController');
const { Post, Image, Like, User, Category } = require('../../models');

jest.mock('../../models', () => ({
  Post: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Image: {
    bulkCreate: jest.fn(),
  },
  Like: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  User: {},
  Category: {},
}));

describe('Test Post Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: { id: 1 },
      body: {},
      params: {},
      files: [],
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('createPost - Membuat Postingan Baru', () => {
    test('berhasil membuat post dengan gambar', async () => {
      mockReq.body = { content: 'Test post', isPrivate: false, categoryId: 1 };
      mockReq.files = [
        { path: 'gambar1.jpg' },
        { path: 'gambar2.jpg' }
      ];

      Post.create.mockResolvedValue({ id: 1, ...mockReq.body });
      Image.bulkCreate.mockResolvedValue([
        { id: 1, imageUrl: 'gambar1.jpg' },
        { id: 2, imageUrl: 'gambar2.jpg' }
      ]);

      await PostController.createPost(mockReq, mockRes, mockNext);

      expect(Post.create).toHaveBeenCalledWith({
        content: 'Test post',
        isPrivate: false,
        CategoryId: 1,
        UserId: 1
      });
      expect(Image.bulkCreate).toHaveBeenCalledWith([
        { imageUrl: 'gambar1.jpg', PostId: 1 },
        { imageUrl: 'gambar2.jpg', PostId: 1 }
      ]);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('berhasil membuat post dengan 1 gambar minimal', async () => {
      mockReq.body = { content: 'Post teks saja' };
      // At least one image is required by the controller
      mockReq.files = [{ path: 'gambar-required.jpg' }];

      Post.create.mockResolvedValue({ id: 1, ...mockReq.body });
      Image.bulkCreate.mockResolvedValue([{ id: 1, imageUrl: 'gambar-required.jpg' }]);

      await PostController.createPost(mockReq, mockRes, mockNext);

      expect(Post.create).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Post teks saja',
        UserId: 1
      }));
      expect(Image.bulkCreate).toHaveBeenCalledWith([
        { imageUrl: 'gambar-required.jpg', PostId: 1 }
      ]);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('getAllPublicPosts - Mendapatkan Semua Post Publik', () => {
    test('berhasil mendapatkan post publik dengan data terkait', async () => {
      const mockPosts = [
        { id: 1, content: 'Post publik 1', User: { username: 'user1' } },
        { id: 2, content: 'Post publik 2', User: { username: 'user2' } }
      ];
      Post.findAll.mockResolvedValue(mockPosts);

      await PostController.getAllPublicPosts(mockReq, mockRes, mockNext);

      expect(Post.findAll).toHaveBeenCalledWith({
        where: { isPrivate: false },
        include: expect.any(Array),
        order: [['createdAt', 'DESC']]
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockPosts);
    });
  });

  describe('updatePost - Mengupdate Postingan', () => {
    test('berhasil mengupdate post sendiri', async () => {
      mockReq.params.id = '1';
      mockReq.body = { content: 'Konten yang diupdate' };
      const mockPost = {
        id: 1,
        UserId: 1,
        update: jest.fn().mockResolvedValue({ id: 1, ...mockReq.body })
      };
      Post.findByPk.mockResolvedValue(mockPost);

      await PostController.updatePost(mockReq, mockRes, mockNext);

      expect(mockPost.update).toHaveBeenCalledWith(mockReq.body);
      // Controller mengembalikan objek dengan shape { message, post }
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        post: expect.objectContaining({ id: 1 })
      }));
    });

    test('mencegah update post user lain', async () => {
      mockReq.params.id = '1';
      Post.findByPk.mockResolvedValue({
        id: 1,
        UserId: 2
      });

      await PostController.updatePost(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.name).toBe('Unauthorized');
    });
  });

  describe('toggleLike - Menyukai/Batal Menyukai Post', () => {
    test('berhasil menyukai post', async () => {
      mockReq.params.id = '1';
      Post.findByPk.mockResolvedValue({ id: 1 });
      Like.findOne.mockResolvedValue(null);
      Like.create.mockResolvedValue({ id: 1, UserId: 1, PostId: '1' });

      await PostController.toggleLike(mockReq, mockRes, mockNext);

      expect(Like.create).toHaveBeenCalledWith({
        UserId: 1,
        PostId: '1'
      });
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Post liked' });
    });

    test('berhasil membatalkan like pada post', async () => {
      mockReq.params.id = '1';
      Post.findByPk.mockResolvedValue({ id: 1 });
      const existingLike = { destroy: jest.fn().mockResolvedValue() };
      Like.findOne.mockResolvedValue(existingLike);

      await PostController.toggleLike(mockReq, mockRes, mockNext);

      expect(existingLike.destroy).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Post unliked' });
    });
  });
});
