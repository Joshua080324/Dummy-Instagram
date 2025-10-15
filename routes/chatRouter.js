const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const auth = require('../helpers/authMiddleware');

router.use(auth);

// Membuat chat AI
router.post('/ai', ChatController.createAIChat);

// Membuat atau mendapatkan chat dengan user lain
router.post('/', ChatController.createOrGetChat);

// Mendapatkan semua chat milik user yang sedang login
router.get('/', ChatController.getUserChats);

// Mendapatkan semua pesan dalam sebuah chat
router.get('/:chatId/messages', ChatController.getChatMessages);

// Mengirim pesan ke sebuah chat
router.post('/:chatId/messages', ChatController.sendMessage);

module.exports = router;