const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");
const auth = require("../helpers/authMiddleware");
const upload = require("../helpers/cloudinary"); 

// Terapkan middleware upload. 'images' adalah nama field, 5 adalah batas maksimal file.
router.post("/", auth, upload.array("images", 5), PostController.createPost);

router.get("/", PostController.getAllPublicPosts);
router.get("/me", auth, PostController.getMyPosts);

router.put("/:id", auth, PostController.updatePost);
router.delete("/:id", auth, PostController.deletePost);

router.post("/:id/like", auth, PostController.toggleLike);

module.exports = router;