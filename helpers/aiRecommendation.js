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
      const cat = like.Post.Category.name;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    if (Object.keys(categoryCount).length === 0) {
      return await Post.findAll({
        where: { isPrivate: false },
        include: [Category, User, Like, Image],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
    }

    const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
    const topCategory = sorted[0][0];
    const stats = sorted.map(([cat, count]) => `${cat}:${count}`).join(', ');

    const prompt = `User liked these categories with counts: ${stats}

Available categories: Travel, Food, Fashion, Technology, Lifestyle

Return only 1 most relevant category for recommendations.
Only use categories from the available list.
Format: CategoryName`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text().trim();
    
    let aiCategory = aiResponse.replace(/['"]/g, '').trim();
    const availableCategories = ["Travel", "Food", "Fashion", "Technology", "Lifestyle"];
    
    let finalCategory = (aiCategory && availableCategories.includes(aiCategory)) 
      ? aiCategory 
      : topCategory;
    
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
    try {
      return await Post.findAll({
        where: { isPrivate: false },
        include: [Category, User, Like, Image],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
    } catch (fallbackErr) {
      return [];
    }
  }
}

module.exports = { getAIRecommendations };
