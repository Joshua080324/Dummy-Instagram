const express = require('express');
const router = express.Router();

const userRouter = require('./userRouter');
const postRouter = require('./postRouter');
const chatRouter = require('./chatRouter');
const aiRouter = require('./aiRouter');

router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/chats', chatRouter);
router.use('/ai', aiRouter); 

module.exports = router;