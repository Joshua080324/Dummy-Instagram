const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Post, Like, Category, User } = require("../models");
const { Op } = require("sequelize");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

async function getAIRecommendations(userId) {
  try {
    const likedPosts = await Like.findAll({
      where: { UserId: userId },
      include: [{ model: Post, include: [Category] }],
    });

    if (likedPosts.length < 3) {  //minimal 3 likes
      return Post.findAll({
        where: { isPrivate: false },
        include: [Category, User, Like],
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
    }

    const userInterests = likedPosts
      .map((l) => `- "${l.Post.content}" (Kategori: ${l.Post.Category?.name || "Umum"})`)
      .join("\n");

    const prompt = `
      Anda adalah sistem rekomendasi konten yang cerdas untuk aplikasi media sosial.
      Seorang pengguna menyukai postingan-postingan berikut:
      ${userInterests}

      Berdasarkan daftar di atas, berikan 3 tampilan kategori yang paling relevan dengan minat pengguna.
      Balas HANYA dengan nama kategori, dipisahkan oleh koma (contoh: Teknologi, Makanan, Olahraga).
    `;

    const result = await model.generateContent(prompt);
    const categoriesText = result.response.text();
    const categories = categoriesText.split(",").map((c) => c.trim());

    const recommendedPosts = await Post.findAll({
      where: {
        isPrivate: false,
        UserId: { [Op.ne]: userId }, // Jangan tampilkan post milik sendiri
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
    // Jika AI gagal, berikan rekomendasi default (post publik terbaru)
    return Post.findAll({
      where: { isPrivate: false },
      include: [Category, User, Like],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
  }
}

module.exports = { getAIRecommendations };