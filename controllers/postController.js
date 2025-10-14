const { Post, Image, User, Category } = require("../models");

class PostController {
  static async createPost(req, res, next) { 
    try {
      const { content, isPrivate, categoryId, imageUrls } = req.body;
      const post = await Post.create({
        content,
        isPrivate,
        CategoryId: categoryId,
        UserId: req.user.id,
      });

      if (imageUrls && imageUrls.length > 0) {
        const imageData = imageUrls.map((url) => ({
          imageUrl: url,
          PostId: post.id,
        }));
        await Image.bulkCreate(imageData);
      }

      res.status(201).json({ message: "Post created successfully", post });
    } catch (err) {
      next(err); 
    }
  }

  static async getAllPublicPosts(req, res, next) {
    try {
      const posts = await Post.findAll({
        where: { isPrivate: false },
        include: [{ model: User, attributes: ["username", "profilePic"] }, Image, Category],
        order: [["createdAt", "DESC"]],
      });
      res.json(posts);
    } catch (err) {
      next(err); 
    }
  }
}

module.exports = PostController;