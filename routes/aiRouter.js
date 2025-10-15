const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const auth = require('../helpers/authMiddleware');

// Endpoint untuk mendapatkan rekomendasi post
router.get('/recommendations', auth, AIController.getRecommendations);

module.exports = router;