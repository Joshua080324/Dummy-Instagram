const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Post, Like, Category, User, Image } = require("../models");
const { Op } = require("sequelize");

async function getAIRecommendations(userId) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.1,
        topP: 0.9,
        topK: 10,
        maxOutputTokens: 50,
      }
    });

    const likedPosts = await Like.findAll({
      where: { UserId: userId },
      include: [{ model: Post, include: [Category] }],
    });

    if (!likedPosts || likedPosts.length < 3) {
      return await Post.findAll({
        where: { isPrivate: false },
        include: [Category, User, Like, Image],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
    }

    const validPosts = likedPosts.filter(like => like.Post && like.Post.Category);
    
    const categoryCount = {};
    validPosts.forEach(like => {
      const categoryName = like.Post.Category.name;
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });

    if (Object.keys(categoryCount).length === 0) {
      return await Post.findAll({
        where: { isPrivate: false },
        include: [Category, User, Like, Image],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
    }

    const sortedCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1]);

    const topCategory = sortedCategories[0][0];

    const availableCategories = ["Travel", "Food", "Fashion", "Technology", "Lifestyle"];

    const categoryStats = sortedCategories
      .map(([cat, count]) => `${cat}:${count}`)
      .join(', ');

    const prompt = `User liked these categories with counts: ${categoryStats}

Available categories: Travel, Food, Fashion, Technology, Lifestyle

Return only 1 most relevant category for recommendations.
Only use categories from the available list.
Format: CategoryName`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text().trim();
    
    let aiCategory = aiResponse
      .replace(/['"]/g, '')
      .trim();

    let finalCategory;
    if (aiCategory && availableCategories.includes(aiCategory)) {
      finalCategory = aiCategory;
    } else {
      finalCategory = topCategory;
    }
    
    const recommendedPosts = await Post.findAll({
      where: {
        isPrivate: false,
        UserId: { [Op.ne]: userId },
      },
      include: [
        { model: Category, where: { name: finalCategory } },
        User,
        Like,
        Image
      ],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    
    return recommendedPosts;
  } catch (err) {
    console.error("Error in AI recommendations:", err.message);
    
    try {
      return await Post.findAll({
        where: { isPrivate: false },
        include: [Category, User, Like, Image],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
    } catch (fallbackErr) {
      console.error("Fallback failed:", fallbackErr.message);
      return [];
    }
  }
}

module.exports = { getAIRecommendations };
