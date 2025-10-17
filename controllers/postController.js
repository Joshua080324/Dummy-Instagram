const { Post, Image, Like, User, Category } = require("../models");

class PostController {
  static async createPost(req, res, next) {
    try {
      const { content, isPrivate, categoryId } = req.body;
      const UserId = req.user.id;
      
      if (!req.files || req.files.length === 0) {
        throw { name: "BadRequest", message: "At least one image is required to create a post." };
      }

      const post = await Post.create({
        content,
        isPrivate: isPrivate === 'true' || isPrivate === true,
        CategoryId: categoryId,
        UserId,
      });

      const imagesToCreate = req.files.map((file) => ({
        imageUrl: file.path,
        PostId: post.id,
      }));

      await Image.bulkCreate(imagesToCreate);

      res.status(201).json({
        message: "Post created successfully",
        post,
        images: imagesToCreate
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAllPublicPosts(req, res, next) {
    try {
      const posts = await Post.findAll({
        where: { isPrivate: false },
        include: [
          { model: User, attributes: ["id", "username", "email"] },
          { model: Image },
          { model: Category, attributes: ["name"] },
          { model: Like },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  // READ USER'S OWN POSTS
  static async getMyPosts(req, res, next) {
    try {
      const posts = await Post.findAll({
        where: { UserId: req.user.id },
        include: [Image, Category, Like],
        order: [["createdAt", "DESC"]],
      });
      res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  // UPDATE POST
  static async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const { content, isPrivate, categoryId } = req.body;

      const post = await Post.findByPk(id);
      if (!post) throw { name: "NotFound" };
      if (post.UserId !== req.user.id) throw { name: "Unauthorized" };

      await post.update({ content, isPrivate, CategoryId: categoryId });
      res.json({ message: "Post updated successfully", post });
    } catch (err) {
      next(err);
    }
  }

  // DELETE POST
  static async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      
      const post = await Post.findByPk(id);
      if (!post) {
        throw { name: "NotFound" };
      }
      
      if (post.UserId != req.user.id) {
        throw { name: "Unauthorized" };
      }

      await post.destroy();
      res.json({ message: "Post deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  // LIKE / UNLIKE POST
  static async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const post = await Post.findByPk(id);
      if (!post) throw { name: "NotFound" };

      const existingLike = await Like.findOne({
        where: { UserId: req.user.id, PostId: id },
      });

      let message;
      if (existingLike) {
        await existingLike.destroy();
        message = "Post unliked";
      } else {
        await Like.create({ UserId: req.user.id, PostId: id });
        message = "Post liked";
      }
      res.json({ message });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PostController;
