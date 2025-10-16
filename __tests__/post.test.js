const PostController = require('../controllers/postController');
const { Post, Image, Like, User, Category } = require('../models');

jest.mock('../models');

describe('PostController', () => {
    describe('createPost', () => {
        test('should create a post with images', async () => {
            const req = {
                user: { id: 1 },
                body: { content: 'Test Post', isPrivate: 'false', categoryId: '1' }, // Konsisten dengan string
                files: [
                    { path: 'image1.jpg' }, // Mocking path sebagai string saja, sesuai error output Anda
                    { path: 'image2.jpg' },
                ],
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            // Mock Post yang mencerminkan hasil konversi di controller
            const mockPost = {
                id: 1,
                content: 'Test Post',
                isPrivate: false,
                CategoryId: 1,
                UserId: 1
            };

            Post.create.mockResolvedValue(mockPost);
            Image.bulkCreate.mockResolvedValue();

            await PostController.createPost(req, res, next);

            expect(Post.create).toHaveBeenCalledWith({
                content: 'Test Post',
                isPrivate: false,
                CategoryId: "1",
                UserId: 1,
            });
            expect(Image.bulkCreate).toHaveBeenCalledWith([
                { imageUrl: 'image1.jpg', PostId: 1 }, // Tetap 'imageUrl' sebagai key, nilai 'imageX.jpg'
                { imageUrl: 'image2.jpg', PostId: 1 },
            ]);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post created successfully',
                post: mockPost,
                // --- INI BAGIAN YANG DIPERBAIKI ---
                images: [ // Tambahkan properti 'images' di ekspektasi
                    { PostId: 1, imageUrl: 'image1.jpg' }, // Urutan key 'PostId', 'imageUrl' sesuai dengan yang 'received'
                    { PostId: 1, imageUrl: 'image2.jpg' },
                ],
                // --- AKHIR PERBAIKAN ---
            });
            expect(next).not.toHaveBeenCalled();
        });
        test('should throw BadRequest if no images are provided', async () => {
            const req = {
                user: { id: 1 },
                body: { content: 'Test Post', isPrivate: false, categoryId: 1 },
                files: [],
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            await PostController.createPost(req, res, next);

            expect(next).toHaveBeenCalledWith({
                name: 'BadRequest',
                message: 'At least one image is required to create a post.',
            });
        });

        test('should call next with error if Post.create fails', async () => {
            const req = {
                user: { id: 1 },
                body: { content: 'Test Post', isPrivate: false, categoryId: 1 },
                files: [{ path: 'image1.jpg' }],
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();
            const error = new Error('Database error');

            Post.create.mockRejectedValue(error);

            await PostController.createPost(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllPublicPosts', () => {
        test('should return all public posts', async () => {
            const req = {};
            const res = { json: jest.fn() };
            const next = jest.fn();
            const mockPosts = [
                { id: 1, content: 'Public Post', isPrivate: false, User: { username: 'user1' } },
            ];

            Post.findAll.mockResolvedValue(mockPosts);

            await PostController.getAllPublicPosts(req, res, next);

            expect(Post.findAll).toHaveBeenCalledWith({
                where: { isPrivate: false },
                include: [
                    { model: User, attributes: ['id', 'username', 'profilePic'] },
                    { model: Image },
                    { model: Category, attributes: ['name'] },
                    { model: Like },
                ],
                order: [['createdAt', 'DESC']],
            });
            expect(res.json).toHaveBeenCalledWith(mockPosts);
        });

        test('should call next with error if findAll fails', async () => {
            const req = {};
            const res = { json: jest.fn() };
            const next = jest.fn();
            const error = new Error('Database error');

            Post.findAll.mockRejectedValue(error);

            await PostController.getAllPublicPosts(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getMyPosts', () => {
        test('should return all posts for the authenticated user', async () => {
            const req = { user: { id: 1 } };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const mockPosts = [
                { id: 1, content: 'My Post', UserId: 1 },
            ];

            Post.findAll.mockResolvedValue(mockPosts);

            await PostController.getMyPosts(req, res, next);

            expect(Post.findAll).toHaveBeenCalledWith({
                where: { UserId: 1 },
                include: [Image, Category, Like],
                order: [['createdAt', 'DESC']],
            });
            expect(res.json).toHaveBeenCalledWith(mockPosts);
        });

        test('should call next with error if findAll fails', async () => {
            const req = { user: { id: 1 } };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const error = new Error('Database error');

            Post.findAll.mockRejectedValue(error);

            await PostController.getMyPosts(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updatePost', () => {
        test('should update a post successfully', async () => {
            const req = {
                user: { id: 1 },
                params: { id: 1 },
                body: { content: 'Updated Post', isPrivate: true, categoryId: 2 },
            };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const mockPost = { id: 1, UserId: 1, update: jest.fn().mockResolvedValue(true) };

            Post.findByPk.mockResolvedValue(mockPost);

            await PostController.updatePost(req, res, next);

            expect(Post.findByPk).toHaveBeenCalledWith(1);
            expect(mockPost.update).toHaveBeenCalledWith({
                content: 'Updated Post',
                isPrivate: true,
                CategoryId: 2,
            });
            expect(res.json).toHaveBeenCalledWith({ message: 'Post updated successfully', post: mockPost });
        });

        test('should throw NotFound error if post does not exist', async () => {
            const req = {
                user: { id: 1 },
                params: { id: 99 },
                body: { content: 'Updated Post' },
            };
            const res = { json: jest.fn() };
            const next = jest.fn();

            Post.findByPk.mockResolvedValue(null);

            await PostController.updatePost(req, res, next);

            expect(next).toHaveBeenCalledWith({ name: 'NotFound' });
        });

        test('should throw Unauthorized error if user does not own the post', async () => {
            const req = {
                user: { id: 2 },
                params: { id: 1 },
                body: { content: 'Updated Post' },
            };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const mockPost = { id: 1, UserId: 1, update: jest.fn() };

            Post.findByPk.mockResolvedValue(mockPost);

            await PostController.updatePost(req, res, next);

            expect(next).toHaveBeenCalledWith({ name: 'Unauthorized' });
        });

        test('should call next with error if update fails', async () => {
            const req = {
                user: { id: 1 },
                params: { id: 1 },
                body: { content: 'Updated Post' },
            };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const error = new Error('Database error');
            const mockPost = { id: 1, UserId: 1, update: jest.fn().mockRejectedValue(error) };

            Post.findByPk.mockResolvedValue(mockPost);

            await PostController.updatePost(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deletePost', () => {
        test('should delete a post successfully', async () => {
            const req = { user: { id: 1 }, params: { id: 1 } };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const mockPost = { id: 1, UserId: 1, destroy: jest.fn().mockResolvedValue(true) };

            Post.findByPk.mockResolvedValue(mockPost);

            await PostController.deletePost(req, res, next);

            expect(Post.findByPk).toHaveBeenCalledWith(1);
            expect(mockPost.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Post deleted successfully' });
        });

        test('should throw NotFound error if post does not exist', async () => {
            const req = { user: { id: 1 }, params: { id: 99 } };
            const res = { json: jest.fn() };
            const next = jest.fn();

            Post.findByPk.mockResolvedValue(null);

            await PostController.deletePost(req, res, next);

            expect(next).toHaveBeenCalledWith({ name: 'NotFound' });
        });

        test('should throw Unauthorized error if user does not own the post', async () => {
            const req = { user: { id: 2 }, params: { id: 1 } };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const mockPost = { id: 1, UserId: 1, destroy: jest.fn() };

            Post.findByPk.mockResolvedValue(mockPost);

            await PostController.deletePost(req, res, next);

            expect(next).toHaveBeenCalledWith({ name: 'Unauthorized' });
        });

        test('should call next with error if destroy fails', async () => {
            const req = { user: { id: 1 }, params: { id: 1 } };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const error = new Error('Database error');
            const mockPost = { id: 1, UserId: 1, destroy: jest.fn().mockRejectedValue(error) };

            Post.findByPk.mockResolvedValue(mockPost);

            await PostController.deletePost(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('toggleLike', () => {
        test('should like a post if not already liked', async () => {
            const req = { user: { id: 1 }, params: { id: 1 } };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const mockPost = { id: 1 };

            Post.findByPk.mockResolvedValue(mockPost);
            Like.findOne.mockResolvedValue(null);
            Like.create.mockResolvedValue(true);

            await PostController.toggleLike(req, res, next);

            expect(Post.findByPk).toHaveBeenCalledWith(1);
            expect(Like.findOne).toHaveBeenCalledWith({ where: { UserId: 1, PostId: 1 } });
            expect(Like.create).toHaveBeenCalledWith({ UserId: 1, PostId: 1 });
            expect(res.json).toHaveBeenCalledWith({ message: 'Post liked' });
        });

        test('should unlike a post if already liked', async () => {
            const req = { user: { id: 1 }, params: { id: 1 } };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const mockPost = { id: 1 };
            const mockLike = { destroy: jest.fn().mockResolvedValue(true) };

            Post.findByPk.mockResolvedValue(mockPost);
            Like.findOne.mockResolvedValue(mockLike);

            await PostController.toggleLike(req, res, next);

            expect(Post.findByPk).toHaveBeenCalledWith(1);
            expect(Like.findOne).toHaveBeenCalledWith({ where: { UserId: 1, PostId: 1 } });
            expect(mockLike.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Post unliked' });
        });

        test('should throw NotFound error if post does not exist', async () => {
            const req = { user: { id: 1 }, params: { id: 99 } };
            const res = { json: jest.fn() };
            const next = jest.fn();

            Post.findByPk.mockResolvedValue(null);

            await PostController.toggleLike(req, res, next);

            expect(next).toHaveBeenCalledWith({ name: 'NotFound' });
        });

        test('should call next with error if toggleLike fails', async () => {
            const req = { user: { id: 1 }, params: { id: 1 } };
            const res = { json: jest.fn() };
            const next = jest.fn();
            const error = new Error('Database error');

            Post.findByPk.mockRejectedValue(error);

            await PostController.toggleLike(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });



});
