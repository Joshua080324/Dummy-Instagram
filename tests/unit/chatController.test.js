const ChatController = require('../../controllers/chatController');
const { Chat, Message, User, Sequelize } = require('../../models');
const { askGemini } = require('../../helpers/aiHelper');

// Mock all dependencies
jest.mock('../../models', () => ({
  Chat: {
    findOrCreate: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Message: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  Sequelize: {
    Op: {
      or: Symbol('or')
    }
  }
}));

jest.mock('../../helpers/aiHelper');

describe('Test Chat Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockSocketIO;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: { id: 1 },
      body: {},
      params: {},
      app: {
        get: jest.fn().mockReturnValue({
          to: jest.fn().mockReturnValue({ emit: jest.fn() })
        })
      }
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    mockSocketIO = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() })
    };
  });

  describe('createOrGetChat - Membuat atau Mendapatkan Chat', () => {
    test('berhasil membuat chat baru', async () => {
      mockReq.body.partnerId = 2;
      Chat.findOrCreate.mockResolvedValue([{ id: 1 }, true]);

      await ChatController.createOrGetChat(mockReq, mockRes, mockNext);

      expect(Chat.findOrCreate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('mencegah user chat dengan dirinya sendiri', async () => {
      mockReq.body.partnerId = 1; // Sama dengan user.id

      await ChatController.createOrGetChat(mockReq, mockRes, mockNext);

      expect(Chat.findOrCreate).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.name).toBe('BadRequest');
    });

    test('mengembalikan chat yang sudah ada', async () => {
      mockReq.body.partnerId = 2;
      Chat.findOrCreate.mockResolvedValue([{ id: 1 }, false]);

      await ChatController.createOrGetChat(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('sendMessage - Mengirim Pesan', () => {
    beforeEach(() => {
      mockReq.params.chatId = '1';
      mockReq.body.content = 'Hello';
    });

    test('berhasil mengirim pesan di chat biasa', async () => {
      Chat.findByPk.mockResolvedValue({
        id: 1,
        UserId: 1,
        partnerId: 2,
        isAIChat: false,
        save: jest.fn()
      });
      Message.create.mockResolvedValue({ id: 1, content: 'Hello' });

      await ChatController.sendMessage(mockReq, mockRes, mockNext);

      expect(Message.create).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('berhasil mengirim pesan dan mendapat respons AI dalam AI chat', async () => {
      Chat.findByPk.mockResolvedValue({
        id: 1,
        UserId: 1,
        isAIChat: true,
        save: jest.fn()
      });
      Message.create.mockResolvedValueOnce({ id: 1, content: 'Hello' });
      askGemini.mockResolvedValue('AI Response');
      Message.create.mockResolvedValueOnce({ id: 2, content: 'AI Response' });

      await ChatController.sendMessage(mockReq, mockRes, mockNext);

      expect(Message.create).toHaveBeenCalledTimes(2);
      expect(askGemini).toHaveBeenCalled();
    });

    test('menangani akses tidak sah', async () => {
      Chat.findByPk.mockResolvedValue({
        id: 1,
        UserId: 3, // Berbeda dari req.user.id
        partnerId: 4,
        isAIChat: false
      });

      await ChatController.sendMessage(mockReq, mockRes, mockNext);

      expect(Message.create).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.name).toBe('Forbidden');
    });

    test('menangani kasus chat tidak ditemukan', async () => {
      Chat.findByPk.mockResolvedValue(null);

      await ChatController.sendMessage(mockReq, mockRes, mockNext);

      expect(Message.create).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.name).toBe('NotFound');
    });
  });
});