const ChatController = require('../controllers/chatController');
const { Chat, Message, User } = require('../models');
const { askGemini } = require('../helpers/aiHelper');

jest.mock('../models');
jest.mock('../helpers/aiHelper');

describe('ChatController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('createOrGetChat', () => {
    it('should create a new chat if one does not exist', async () => {
      const req = { 
        user: { id: 1 }, 
        body: { partnerId: 2 } 
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      const mockChat = { 
        id: 1, 
        UserId: 1, 
        partnerId: 2, 
        isAIChat: false 
      };

      Chat.findOrCreate.mockResolvedValue([mockChat, true]);

      await ChatController.createOrGetChat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockChat);
    });

    test('should return existing chat if one exists', async () => {
      const req = { user: { id: 1 }, body: { partnerId: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const mockChat = { id: 1, UserId: 1, partnerId: 2, isAIChat: false };

      Chat.findOrCreate.mockResolvedValue([mockChat, false]);

      await ChatController.createOrGetChat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockChat);
    });

    test('should throw BadRequest if user tries to chat with themselves', async () => {
      const req = { user: { id: 1 }, body: { partnerId: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await ChatController.createOrGetChat(req, res, next);

      expect(next).toHaveBeenCalledWith({
        name: 'BadRequest',
        message: 'You cannot create a chat with yourself.',
      });
    });

    test('should call next with error if findOrCreate fails', async () => {
      const req = { user: { id: 1 }, body: { partnerId: 2 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const error = new Error('Database error');

      Chat.findOrCreate.mockRejectedValue(error);

      await ChatController.createOrGetChat(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserChats', () => {
    it('should return all chats for a user', async () => {
      const req = { user: { id: 1 } };
      const res = { json: jest.fn() };
      const next = jest.fn();
      const mockChats = [
        { id: 1, UserId: 1, partnerId: 2, creator: { username: 'user1' }, partner: { username: 'user2' } },
      ];

      Chat.findAll.mockResolvedValue(mockChats);

      await ChatController.getUserChats(req, res, next);

      // We only test the response, not the exact query
      expect(res.json).toHaveBeenCalledWith(mockChats);
    });

    test('should call next with error if findAll fails', async () => {
      const req = { user: { id: 1 } };
      const res = { json: jest.fn() };
      const next = jest.fn();
      const error = new Error('Database error');

      Chat.findAll.mockRejectedValue(error);

      await ChatController.getUserChats(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getChatMessages', () => {
    test('should return messages for a valid chat', async () => {
      const req = { user: { id: 1 }, params: { chatId: 1 } };
      const res = { json: jest.fn() };
      const next = jest.fn();
      const mockChat = { id: 1, UserId: 1, partnerId: 2 };
      const mockMessages = [{ id: 1, content: 'Hello', sender: { username: 'user1' } }];

      Chat.findByPk.mockResolvedValue(mockChat);
      Message.findAll.mockResolvedValue(mockMessages);

      await ChatController.getChatMessages(req, res, next);

      expect(Chat.findByPk).toHaveBeenCalledWith(1);
      expect(Message.findAll).toHaveBeenCalledWith({
        where: { ChatId: 1 },
        include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
        order: [['createdAt', 'ASC']],
      });
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    test('should throw Forbidden error if user is not part of the chat', async () => {
      const req = { user: { id: 3 }, params: { chatId: 1 } };
      const res = { json: jest.fn() };
      const next = jest.fn();
      const mockChat = { id: 1, UserId: 1, partnerId: 2 };

      Chat.findByPk.mockResolvedValue(mockChat);

      await ChatController.getChatMessages(req, res, next);

      expect(next).toHaveBeenCalledWith({ name: 'Forbidden' });
    });

    test('should throw Forbidden error if chat not found', async () => {
      const req = { user: { id: 1 }, params: { chatId: 99 } };
      const res = { json: jest.fn() };
      const next = jest.fn();

      Chat.findByPk.mockResolvedValue(null);

      await ChatController.getChatMessages(req, res, next);

      expect(next).toHaveBeenCalledWith({ name: 'Forbidden' });
    });

    test('should call next with error if findByPk fails', async () => {
      const req = { user: { id: 1 }, params: { chatId: 1 } };
      const res = { json: jest.fn() };
      const next = jest.fn();
      const error = new Error('Database error');

      Chat.findByPk.mockRejectedValue(error);

      await ChatController.getChatMessages(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createAIChat', () => {
    test('should create a new AI chat if one does not exist', async () => {
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const mockChat = { id: 1, UserId: 1, isAIChat: true, partnerId: null };

      Chat.findOrCreate.mockResolvedValue([mockChat, true]);

      await ChatController.createAIChat(req, res, next);

      expect(Chat.findOrCreate).toHaveBeenCalledWith({
        where: {
          UserId: 1,
          isAIChat: true,
        },
        defaults: {
          UserId: 1,
          isAIChat: true,
          partnerId: null,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockChat);
    });

    test('should return existing AI chat if one exists', async () => {
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const mockChat = { id: 1, UserId: 1, isAIChat: true, partnerId: null };

      Chat.findOrCreate.mockResolvedValue([mockChat, false]);

      await ChatController.createAIChat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockChat);
    });

    test('should call next with error if findOrCreate fails', async () => {
      const req = { user: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const error = new Error('Database error');

      Chat.findOrCreate.mockRejectedValue(error);

      await ChatController.createAIChat(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('sendMessage', () => {
    let mockIo;
    beforeEach(() => {
      mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
    });

    test('should send a user message and return it', async () => {
      const req = { user: { id: 1 }, params: { chatId: 1 }, body: { content: 'Hello' }, app: { get: jest.fn().mockReturnValue(mockIo) } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const mockChat = { id: 1, UserId: 1, partnerId: 2, isAIChat: false, save: jest.fn() };
      const mockUserMessage = { ChatId: 1, senderId: 1, content: 'Hello' };

      Chat.findByPk.mockResolvedValue(mockChat);
      Message.create.mockResolvedValue(mockUserMessage);

      await ChatController.sendMessage(req, res, next);

      expect(Chat.findByPk).toHaveBeenCalledWith(1);
      expect(Message.create).toHaveBeenCalledWith({
        ChatId: 1,
        senderId: 1,
        content: 'Hello',
      });
      expect(mockIo.to).toHaveBeenCalledWith('chat_1');
      expect(mockIo.emit).toHaveBeenCalledWith('receive_message', mockUserMessage);
      expect(mockChat.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUserMessage);
    });

    test('should send a user message and an AI response for AI chat', async () => {
      const req = { user: { id: 1 }, params: { chatId: 1 }, body: { content: 'Hello AI' }, app: { get: jest.fn().mockReturnValue(mockIo) } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const mockChat = { id: 1, UserId: 1, isAIChat: true, save: jest.fn() };
      const mockUserMessage = { ChatId: 1, senderId: 1, content: 'Hello AI' };
      const mockAiResponseText = 'AI response';
      const mockAiMessage = { ChatId: 1, senderId: null, content: mockAiResponseText };

      Chat.findByPk.mockResolvedValue(mockChat);
      Message.create.mockResolvedValueOnce(mockUserMessage).mockResolvedValueOnce(mockAiMessage);
      askGemini.mockResolvedValue(mockAiResponseText);

      await ChatController.sendMessage(req, res, next);

      expect(Chat.findByPk).toHaveBeenCalledWith(1);
      expect(Message.create).toHaveBeenCalledWith({
        ChatId: 1,
        senderId: 1,
        content: 'Hello AI',
      });
      expect(askGemini).toHaveBeenCalledWith('Hello AI');
      expect(Message.create).toHaveBeenCalledWith({
        ChatId: 1,
        senderId: null,
        content: mockAiResponseText,
      });
      expect(mockIo.to).toHaveBeenCalledWith('chat_1');
      expect(mockIo.emit).toHaveBeenCalledWith('receive_message', mockUserMessage);
      expect(mockIo.emit).toHaveBeenCalledWith('receive_message', mockAiMessage);
      expect(mockChat.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUserMessage);
    });

    test('should throw NotFound error if chat does not exist', async () => {
      const req = { user: { id: 1 }, params: { chatId: 99 }, body: { content: 'Hello' }, app: { get: jest.fn().mockReturnValue(mockIo) } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      Chat.findByPk.mockResolvedValue(null);

      await ChatController.sendMessage(req, res, next);

      expect(next).toHaveBeenCalledWith({ name: 'NotFound', message: 'Chat not found' });
    });

    test('should throw Forbidden error if user is not authorized for the chat', async () => {
      const req = { user: { id: 3 }, params: { chatId: 1 }, body: { content: 'Hello' }, app: { get: jest.fn().mockReturnValue(mockIo) } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const mockChat = { id: 1, UserId: 1, partnerId: 2, isAIChat: false, save: jest.fn() };

      Chat.findByPk.mockResolvedValue(mockChat);

      await ChatController.sendMessage(req, res, next);

      expect(next).toHaveBeenCalledWith({ name: 'Forbidden', message: 'You are not authorized to access this chat' });
    });

    test('should call next with error if sendMessage fails', async () => {
      const req = { user: { id: 1 }, params: { chatId: 1 }, body: { content: 'Hello' }, app: { get: jest.fn().mockReturnValue(mockIo) } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      const error = new Error('Database error');
      const mockChat = { id: 1, UserId: 1, partnerId: 2, isAIChat: false, save: jest.fn() };

      Chat.findByPk.mockResolvedValue(mockChat);
      Message.create.mockRejectedValue(error);

      await ChatController.sendMessage(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
