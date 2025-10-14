const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");
const auth = require("../helpers/authMiddleware");

router.post("/", auth, PostController.createPost);
router.get("/", PostController.getAllPublicPosts);

module.exports = router;
