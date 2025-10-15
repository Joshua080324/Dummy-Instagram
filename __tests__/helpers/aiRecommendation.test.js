const { Op } = require("sequelize");

// ✅ Mock duluan SEBELUM require helper
jest.mock("../../models", () => ({
  Post: {},
  Like: {},
  Category: {},
  User: {},
}));

jest.mock("@google/generative-ai", () => {
  const mockGenerateContent = jest.fn().mockResolvedValue({
    response: { text: () => "Tech, Food, Sports" },
  });

  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: jest.fn(() => ({
        generateContent: mockGenerateContent,
      })),
    })),
  };
});

describe("AI Recommendation", () => {
  let aiRecommendation;
  let Like, Post, Category, User;
  let mockModel;

  beforeEach(() => {
    jest.resetModules();
    process.env.GEMINI_API_KEY = "test-key";

    // Import setelah mock siap
    const models = require("../../models");
    Like = models.Like;
    Post = models.Post;
    Category = models.Category;
    User = models.User;

    Like.findAll = jest.fn();
    Post.findAll = jest.fn();
    Category.findAll = jest.fn();
    User.findAll = jest.fn();

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    mockModel = new GoogleGenerativeAI().getGenerativeModel();

    aiRecommendation = require("../../helpers/aiRecommendation");
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  test("should return default recommendations when user has less than 3 likes", async () => {
    const userId = 1;
    const mockLikes = [{ Post: { content: "Post 1", Category: { name: "Cat1" } } }];
    const mockDefaultPosts = [{ id: 1, content: "Default post" }];

    Like.findAll.mockResolvedValue(mockLikes);
    Post.findAll.mockResolvedValue(mockDefaultPosts);

    const result = await aiRecommendation.getAIRecommendations(userId);

    expect(Like.findAll).toHaveBeenCalledWith({
      where: { UserId: userId },
      include: [{ model: Post, include: [Category] }],
    });

    expect(Post.findAll).toHaveBeenCalledWith({
      where: { isPrivate: false },
      include: [Category, User, Like],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    expect(result).toEqual(mockDefaultPosts);
  });

  test("should return AI recommendations when user has enough likes", async () => {
    const userId = 1;
    const mockLikes = [
      { Post: { content: "Post 1", Category: { name: "Tech" } } },
      { Post: { content: "Post 2", Category: { name: "Food" } } },
      { Post: { content: "Post 3", Category: { name: "Sports" } } },
    ];
    const mockRecommendedPosts = [{ id: 1, content: "Recommended post" }];

    Like.findAll.mockResolvedValue(mockLikes);
    Post.findAll.mockResolvedValue(mockRecommendedPosts);

    const result = await aiRecommendation.getAIRecommendations(userId);

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const mockGenerateContent = new GoogleGenerativeAI().getGenerativeModel().generateContent;
    expect(mockGenerateContent).toHaveBeenCalled();

    const prompt = mockGenerateContent.mock.calls[0][0];
    expect(prompt).toContain("Anda adalah sistem rekomendasi konten");
    expect(prompt).toContain("Post 1");
    expect(prompt).toContain("Tech");

    expect(Post.findAll).toHaveBeenCalledWith({
      where: {
        isPrivate: false,
        UserId: { [Op.ne]: userId },
      },
      include: [
        { model: Category, where: { name: { [Op.in]: ["Tech", "Food", "Sports"] } } },
        User,
        Like,
      ],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    expect(result).toEqual(mockRecommendedPosts);
  });

  test("should handle errors and return default recommendations", async () => {
    const userId = 1;
    const mockError = new Error("Database error");
    const mockDefaultPosts = [{ id: 1, content: "Default post" }];

    Like.findAll.mockRejectedValue(mockError);
    Post.findAll.mockResolvedValue(mockDefaultPosts);
    console.error = jest.fn();

    const result = await aiRecommendation.getAIRecommendations(userId);

    expect(console.error).toHaveBeenCalledWith(
      "Error getting AI recommendations:",
      mockError
    );

    expect(Post.findAll).toHaveBeenCalledWith({
      where: { isPrivate: false },
      include: [Category, User, Like],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    expect(result).toEqual(mockDefaultPosts);
  });

  test("should handle posts without categories", async () => {
    const userId = 1;
    const mockLikes = [
      { Post: { content: "Post 1", Category: null } },
      { Post: { content: "Post 2", Category: { name: "Food" } } },
      { Post: { content: "Post 3", Category: null } },
    ];
    const mockAIResponse = {
      response: { text: () => "Food, General" },
    };
    const mockRecommendedPosts = [{ id: 1, content: "Recommended post" }];

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const mockGenerateContent = new GoogleGenerativeAI().getGenerativeModel().generateContent;
    mockGenerateContent.mockResolvedValue(mockAIResponse);

    Like.findAll.mockResolvedValue(mockLikes);
    Post.findAll.mockResolvedValue(mockRecommendedPosts);

    const result = await aiRecommendation.getAIRecommendations(userId);

    expect(mockGenerateContent).toHaveBeenCalled();
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs).toContain("Kategori: Umum");
    expect(result).toEqual(mockRecommendedPosts);
  });
});
