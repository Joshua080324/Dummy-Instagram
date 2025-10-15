const UserController = require('../controllers/userController');
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { signToken } = require('../helpers/jwt');
const { OAuth2Client } = require('google-auth-library');

jest.mock('../models');
jest.mock('bcryptjs');
jest.mock('../helpers/jwt');
jest.mock('google-auth-library');

describe('UserController', () => {
  describe('register', () => {
    test('should register a new user successfully', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const newUser = { id: 1, username: 'testuser', email: 'test@example.com' };

      User.create.mockResolvedValue(newUser);

      await UserController.register(req, res, next);

      expect(User.create).toHaveBeenCalledWith({ username: 'testuser', email: 'test@example.com', password: 'password123' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, username: 'testuser', email: 'test@example.com' });
    });

    test('should call next with error if User.create fails', async () => {
      const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const error = new Error('Database error');

      User.create.mockRejectedValue(error);

      await UserController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    test('should login user successfully with valid credentials', async () => {
      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedpassword' };
      const mockToken = 'mockAccessToken';

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(true);
      signToken.mockReturnValue(mockToken);

      await UserController.login(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(signToken).toHaveBeenCalledWith({ id: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ access_token: mockToken });
    });

    test('should throw BadRequest if email or password is missing', async () => {
      const req = { body: { email: 'test@example.com' } }; // Missing password
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await UserController.login(req, res, next);

      expect(next).toHaveBeenCalledWith({ name: 'BadRequest', message: 'Email and password are required' });
    });

    test('should throw InvalidLogin if user not found', async () => {
      const req = { body: { email: 'nonexistent@example.com', password: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      User.findOne.mockResolvedValue(null);

      await UserController.login(req, res, next);

      expect(next).toHaveBeenCalledWith({ name: 'InvalidLogin' });
    });

    test('should throw InvalidLogin if password is incorrect', async () => {
      const req = { body: { email: 'test@example.com', password: 'wrongpassword' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedpassword' };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compareSync.mockReturnValue(false);

      await UserController.login(req, res, next);

      expect(next).toHaveBeenCalledWith({ name: 'InvalidLogin' });
    });

    test('should call next with error if login fails', async () => {
      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const error = new Error('Database error');

      User.findOne.mockRejectedValue(error);

      await UserController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('googleSignIn', () => {
    let mockTicket;

    beforeEach(() => {
      process.env.GOOGLE_CLIENT_ID = 'mock-client-id';
      mockTicket = {
        getPayload: jest.fn().mockReturnValue({
          email: 'google@example.com',
          name: 'Google User',
          picture: 'google.jpg',
        }),
      };
      OAuth2Client.prototype.verifyIdToken = jest.fn().mockResolvedValue(mockTicket);
    });

    afterEach(() => {
      delete process.env.GOOGLE_CLIENT_ID;
      jest.clearAllMocks();
    });

    test('should sign in/up user with google token', async () => {
      const req = { body: { google_token: 'mockGoogleToken' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const mockUser = { id: 1, email: 'google@example.com' };
      const mockAccessToken = 'mockAccessToken';

      User.findOrCreate.mockResolvedValue([mockUser, true]);
      signToken.mockReturnValue(mockAccessToken);

      await UserController.googleSignIn(req, res, next);

      expect(OAuth2Client.prototype.verifyIdToken).toHaveBeenCalledWith({
        idToken: 'mockGoogleToken',
        audience: 'mock-client-id',
      });
      expect(mockTicket.getPayload).toHaveBeenCalled();
      expect(User.findOrCreate).toHaveBeenCalledWith({
        where: { email: 'google@example.com' },
        defaults: {
          username: 'Google User',
          email: 'google@example.com',
          password: expect.any(String),
          profilePic: 'google.jpg',
        },
        hooks: false,
      });
      expect(signToken).toHaveBeenCalledWith({ id: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ access_token: mockAccessToken });
    });

    test('should call next with error if googleSignIn fails', async () => {
      const req = { body: { google_token: 'mockGoogleToken' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const error = new Error('Google auth error');

      OAuth2Client.prototype.verifyIdToken.mockRejectedValueOnce(error);

      await UserController.googleSignIn(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
