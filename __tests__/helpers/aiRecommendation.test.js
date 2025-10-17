const { Op } = require("sequelize");

jest.mock("../../models", () => ({
  Post: {},
  Like: {},
  Category: {},
  User: {},
  Image: {},
}));

jest.mock("@google/generative-ai", () => {
  const mockGenerateContent = jest.fn().mockResolvedValue({
    response: { text: () => "Tech" },
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
  let Like, Post, Category, User, Image;
  let mockModel;

  beforeEach(() => {
    jest.resetModules();
    process.env.GEMINI_API_KEY = "test-key";

    const models = require("../../models");
    Like = models.Like;
    Post = models.Post;
    Category = models.Category;
    User = models.User;
    Image = models.Image;

    Like.findAll = jest.fn();
    Post.findAll = jest.fn();
    Category.findAll = jest.fn();
    User.findAll = jest.fn();
    Image.findAll = jest.fn();

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
      include: [Category, User, Like, Image],
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
    expect(prompt).toContain("User liked these categories with counts:");
    expect(prompt).toContain("Tech:");
    expect(prompt).toContain("Available categories: Travel, Food, Fashion, Technology, Lifestyle");

    expect(Post.findAll).toHaveBeenCalledWith({
      where: {
        isPrivate: false,
        UserId: { [Op.ne]: userId },
      },
      include: [
        { model: Category, where: { name: "Tech" } },
        User,
        Like,
        Image
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
      "Error in AI recommendations:",
      "Database error"
    );

    expect(Post.findAll).toHaveBeenCalledWith({
      where: { isPrivate: false },
      include: [Category, User, Like, Image],
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
    expect(callArgs).toContain("Food:");
    expect(result).toEqual(mockRecommendedPosts);
  });
});
