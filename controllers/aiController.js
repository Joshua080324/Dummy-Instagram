const { getAIRecommendations } = require("../helpers/aiRecommendation");

class AIController {
  static async getRecommendations(req, res, next) {
    try {

      if (!req.user || !req.user.id) {
        throw { name: "Unauthorized" };
      }

      const userId = req.user.id;
      const posts = await getAIRecommendations(userId);

      res.status(200).json({
        message: "Rekomendasi berhasil dibuat",
        count: posts.length,
        data: posts,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AIController;
