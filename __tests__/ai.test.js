const AIController = require('../controllers/aiController');
const { getAIRecommendations } = require('../helpers/aiRecommendation');

jest.mock('../helpers/aiRecommendation');

describe('AIController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    it('should return recommendations when user is authenticated', async () => {
      const mockPosts = [
        { 
          id: 1, 
          title: 'Post 1',
          toJSON: function() { return { id: this.id, title: this.title }; }
        }
      ];
      getAIRecommendations.mockResolvedValue(mockPosts);

      const req = { user: { id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await AIController.getRecommendations(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rekomendasi berhasil dibuat",
        count: 1,
        data: [{ id: 1, title: 'Post 1' }]
      });
    });

    it('should call next with error when user is not authenticated', async () => {
      const req = { user: null };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await AIController.getRecommendations(req, res, next);

      expect(next).toHaveBeenCalledWith({ name: "Unauthorized" });
    });
  });
});
