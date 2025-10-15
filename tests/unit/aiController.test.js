const AIController = require('../../controllers/aiController');
const { getAIRecommendations } = require('../../helpers/aiRecommendation');

// Mock the AI recommendation helper
jest.mock('../../helpers/aiRecommendation');

describe('Test AI Controller', () => {
  // Reset semua mock sebelum setiap test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations - Mendapatkan Rekomendasi Post', () => {
    const mockReq = { user: { id: 1 } };
    const mockRes = { 
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    const mockNext = jest.fn();

    test('berhasil mengembalikan rekomendasi post', async () => {
      // Mock successful recommendation
      const mockPosts = [
        { id: 1, content: 'Post 1' },
        { id: 2, content: 'Post 2' }
      ];
      getAIRecommendations.mockResolvedValue(mockPosts);

      await AIController.getRecommendations(mockReq, mockRes, mockNext);

      expect(getAIRecommendations).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Rekomendasi berhasil dibuat",
        count: 2,
        data: mockPosts
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('berhasil menangani kasus rekomendasi kosong', async () => {
      // Mock rekomendasi kosong
      getAIRecommendations.mockResolvedValue([]);

      await AIController.getRecommendations(mockReq, mockRes, mockNext);

      expect(getAIRecommendations).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Rekomendasi berhasil dibuat",
        count: 0,
        data: []
      });
    });

    test('berhasil menangani kasus AI service timeout', async () => {
      // Mock AI service timeout
      getAIRecommendations.mockRejectedValue(new Error('AI Service Timeout'));

      await AIController.getRecommendations(mockReq, mockRes, mockNext);

      expect(getAIRecommendations).toHaveBeenCalledWith(1);
      expect(mockNext).toHaveBeenCalledWith(new Error('AI Service Timeout'));
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('handles missing user in request', async () => {
      const reqWithoutUser = { user: null };
      
      await AIController.getRecommendations(reqWithoutUser, mockRes, mockNext);

      expect(getAIRecommendations).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.name).toBe('Unauthorized');
    });
  });
});