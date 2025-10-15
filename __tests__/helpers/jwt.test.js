const mockSign = jest.fn();
const mockVerify = jest.fn();

jest.mock('jsonwebtoken', () => ({
  sign: mockSign,
  verify: mockVerify
}));

const jwt = require('jsonwebtoken');

describe('JWT Helper', () => {
  let jwtHelpers;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.resetModules();
    jest.clearAllMocks();
    jwtHelpers = require('../../helpers/jwt');
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    jest.clearAllMocks();
  });

  describe('signToken', () => {
    test('should call jwt.sign with correct parameters', () => {
      const payload = { id: 1, username: 'testuser' };
      const mockToken = 'mock-token';
      mockSign.mockReturnValue(mockToken);

      const token = jwtHelpers.signToken(payload);

      expect(mockSign).toHaveBeenCalledWith(payload, 'test-secret');
      expect(token).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    test('should call jwt.verify with correct parameters', () => {
      const token = 'test-token';
      const decodedPayload = { id: 1, username: 'testuser' };
      mockVerify.mockReturnValue(decodedPayload);

      const result = jwtHelpers.verifyToken(token);

      expect(mockVerify).toHaveBeenCalledWith(token, 'test-secret');
      expect(result).toBe(decodedPayload);
    });

    test('should throw error if token is invalid', () => {
      const token = 'invalid-token';
      const error = new Error('Invalid token');
      mockVerify.mockImplementation(() => {
        throw error;
      });

      expect(() => {
        jwtHelpers.verifyToken(token);
      }).toThrow(error);
    });
  });
});