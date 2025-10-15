jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn();
  const mockModel = { generateContent: mockGenerateContent };
  const mockGenAI = {
    getGenerativeModel: jest.fn(() => mockModel),
  };

  // ekspor juga mock agar bisa diakses di test
  return {
    GoogleGenerativeAI: jest.fn(() => mockGenAI),
    __mock__: { mockGenerateContent, mockModel, mockGenAI },
  };
});

describe('AI Helper', () => {
  let aiHelper;
  let mockGenerateContent;

  beforeEach(() => {
    jest.resetModules();
    process.env.GEMINI_API_KEY = 'test-key';

    // ambil mockGenerateContent dari module mock di atas
    const { __mock__ } = require('@google/generative-ai');
    mockGenerateContent = __mock__.mockGenerateContent;
    mockGenerateContent.mockReset();

    // import setelah mock aktif
    aiHelper = require('../../helpers/aiHelper');
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
    jest.clearAllMocks();
  });

  test('should clean and return Gemini response', async () => {
    const mockRawText = '# Heading\n1. List item\n- Bullet point\n**Bold text**\nNormal text';
    mockGenerateContent.mockResolvedValue({
      response: { text: () => mockRawText },
    });

    const result = await aiHelper.askGemini('Test prompt');

    expect(mockGenerateContent).toHaveBeenCalledWith('Test prompt');
    expect(result).toBe('List item Bullet point Bold text Normal text');
  });

  test('should handle error from Gemini', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'));
    console.error = jest.fn();

    const result = await aiHelper.askGemini('Test prompt');

    expect(console.error).toHaveBeenCalled();
    expect(result).toBe('Maaf, saya mengalami kesulitan menjawab saat ini.');
  });

  test('should handle empty text', async () => {
    mockGenerateContent.mockResolvedValue({
      response: { text: () => '' },
    });

    const result = await aiHelper.askGemini('Test prompt');
    expect(result).toBe('');
  });

  test('should clean markdown properly', () => {
  const { cleanText } = require('../../helpers/aiHelper');
  const dirty = `## Heading\n1. One\n- Two\n**Bold** *Italic*`;
  const clean = cleanText(dirty);
  expect(clean).toBe('One Two Bold Italic');
});
test('should handle undefined input gracefully', () => {
  const { cleanText } = require('../../helpers/aiHelper');
  const clean = cleanText(); 
  expect(clean).toBe(''); 
});



});
