const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Post, Like, Category, User } = require("../models");
const { Op } = require("sequelize");

async function getAIRecommendations(userId) {
  try {
    // ✅ Inisialisasi Gemini di dalam fungsi agar bisa dimock
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const likedPosts = await Like.findAll({
      where: { UserId: userId },
      include: [{ model: Post, include: [Category] }],
    });

    // ✅ Kalau user belum banyak like → return default post
    if (!likedPosts || likedPosts.length < 3) {
      return await Post.findAll({
        where: { isPrivate: false },
        include: [Category, User, Like],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
    }

    const userInterests = likedPosts
      .map(
        (like) =>
          `- "${like.Post.content}" (Kategori: ${like.Post.Category?.name || "Umum"})`
      )
      .join("\n");

    const prompt = `
      Anda adalah sistem rekomendasi konten untuk aplikasi media sosial.
      Pengguna menyukai postingan berikut:
      ${userInterests}

      Berdasarkan daftar ini, berikan 3 kategori paling relevan, dipisahkan koma.
    `;

    const result = await model.generateContent(prompt);
    const categoriesText = result.response.text();
    const categories = categoriesText.split(",").map((c) => c.trim());

    const recommendedPosts = await Post.findAll({
      where: {
        isPrivate: false,
        UserId: { [Op.ne]: userId },
      },
      include: [
        { model: Category, where: { name: { [Op.in]: categories } } },
        User,
        Like,
      ],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    return recommendedPosts;
  } catch (err) {
    console.error("Error getting AI recommendations:", err);
    return await Post.findAll({
      where: { isPrivate: false },
      include: [Category, User, Like],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
  }
}

module.exports = { getAIRecommendations };
