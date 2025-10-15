const { verifyToken } = require('../../helpers/jwt');
const { User } = require('../../models');
const authMiddleware = require('../../helpers/authMiddleware');

jest.mock('../../helpers/jwt');
jest.mock('../../models');

describe('authMiddleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    test('should pass authentication with valid token', async () => {
        const mockUserId = 1;
        const mockUser = { id: mockUserId, username: 'testuser' };
        const mockToken = 'valid.jwt.token';

        mockReq.headers.authorization = `Bearer ${mockToken}`;
        verifyToken.mockReturnValue({ id: mockUserId });
        User.findByPk.mockResolvedValue(mockUser);

        await authMiddleware(mockReq, mockRes, mockNext);

        expect(verifyToken).toHaveBeenCalledWith(mockToken);
        expect(User.findByPk).toHaveBeenCalledWith(mockUserId);
        expect(mockReq.user).toEqual(mockUser);
        expect(mockReq.userId).toBe(mockUserId);
        expect(mockNext).toHaveBeenCalled();
    });

    test('should fail authentication with missing token', async () => {
        await authMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith({
            name: 'Unauthorized',
            message: 'Please login first'
        });
    });

    test('should fail authentication with invalid token format', async () => {
        mockReq.headers.authorization = 'InvalidFormat token';

        await authMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith({
            name: 'Unauthorized',
            message: 'Please login first'
        });
    });

    test('should fail authentication when token verification fails', async () => {
        mockReq.headers.authorization = 'Bearer invalid.token';
        verifyToken.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        await authMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith({
            name: 'Unauthorized',
            message: 'Please login first'
        });
    });

    test('should fail authentication when user not found', async () => {
        const mockToken = 'valid.jwt.token';
        mockReq.headers.authorization = `Bearer ${mockToken}`;
        verifyToken.mockReturnValue({ id: 999 });
        User.findByPk.mockResolvedValue(null);

        await authMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith({
            name: 'Unauthorized',
            message: 'User not found'
        });
    });

    test('should handle database errors', async () => {
        const mockToken = 'valid.jwt.token';
        mockReq.headers.authorization = `Bearer ${mockToken}`;
        verifyToken.mockReturnValue({ id: 1 });

        const dbError = new Error('Database error');
        User.findByPk.mockRejectedValue(dbError);

        await authMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith({
            name: 'Internal Server Error',
            message: 'Database error'
        });
    });


});