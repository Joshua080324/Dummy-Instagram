const { getAIRecommendations } = require("../helpers/aiRecommendation");

class AIController {
  static async getRecommendations(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        throw { name: "Unauthorized" };
      }

      const userId = req.user.id;
      const posts = await getAIRecommendations(userId);

      const plainPosts = posts.map(post => post.toJSON());

      res.status(200).json({
        message: "Rekomendasi berhasil dibuat",
        count: plainPosts.length,
        data: plainPosts,
      });
    } catch (err) {
      console.error("Error in AIController:", err.message);
      next(err);
    }
  }
}

module.exports = AIController;
