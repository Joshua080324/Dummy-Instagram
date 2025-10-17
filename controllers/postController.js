const { Post, Image, Like, User, Category } = require("../models");

class PostController {
  // CREATE POST 
  static async createPost(req, res, next) {
    try {
      const { content, isPrivate, categoryId } = req.body;
      const UserId = req.user.id; 
      // 1. Validasi: pastikan ada setidaknya 1 gambar
      // Jika upload gagal di Multer (misalnya tidak ada file), error akan di-catch oleh handleError
      if (!req.files || req.files.length === 0) {
        throw { name: "BadRequest", message: "At least one image is required to create a post." };
      }

      // 2. Buat postingan baru di database
      const post = await Post.create({
        content,
        // Konversi string 'true'/'false' ke boolean
        isPrivate: isPrivate === 'true' || isPrivate === true, // handle both string and actual boolean if any
        CategoryId: categoryId,
        UserId,
      });

      // 3. Ambil URL gambar dari req.files (yang sudah diunggah oleh multer-storage-cloudinary)
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

  // READ ALL PUBLIC POSTS
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
      
      console.log('Delete request for post:', id);
      console.log('User ID from token:', req.user?.id);
      
      const post = await Post.findByPk(id);
      if (!post) {
        console.log('Post not found:', id);
        throw { name: "NotFound" };
      }
      
      console.log('Post UserId:', post.UserId, typeof post.UserId);
      console.log('Request User Id:', req.user.id, typeof req.user.id);
      
      // Use == instead of === to handle potential type mismatch
      if (post.UserId != req.user.id) {
        console.log('Unauthorized: User does not own this post');
        throw { name: "Unauthorized" };
      }

      await post.destroy();
      console.log('Post deleted successfully:', id);
      res.json({ message: "Post deleted successfully" });
    } catch (err) {
      console.error('Error in deletePost:', err);
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
