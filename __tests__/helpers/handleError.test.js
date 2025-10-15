const handleError = require('../../helpers/handleError');

describe('handleError', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    console.error = jest.fn(); // Mock console.error
  });

  test('should handle Unauthorized error', () => {
    const error = { name: 'Unauthorized' };
    handleError(error, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized access' });
  });

  test('should handle InvalidLogin error', () => {
    const error = { name: 'InvalidLogin' };
    handleError(error, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });

  test('should handle NotFound error', () => {
    const error = { name: 'NotFound' };
    handleError(error, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Data not found' });
  });

  test('should handle BadRequest error with custom message', () => {
    const error = { name: 'BadRequest', message: 'Custom error message' };
    handleError(error, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Custom error message' });
  });

  test('should handle BadRequest error without custom message', () => {
    const error = { name: 'BadRequest' };
    handleError(error, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Bad request' });
  });

  test('should handle SequelizeValidationError', () => {
    const error = {
      name: 'SequelizeValidationError',
      errors: [
        { message: 'Error 1' },
        { message: 'Error 2' }
      ]
    };
    handleError(error, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: ['Error 1', 'Error 2'] });
  });

  test('should handle SequelizeUniqueConstraintError', () => {
    const error = {
      name: 'SequelizeUniqueConstraintError',
      errors: [
        { message: 'Duplicate entry' }
      ]
    };
    handleError(error, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: ['Duplicate entry'] });
  });

  test('should handle unknown errors with 500 status code', () => {
    const error = { name: 'UnknownError' };
    handleError(error, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});