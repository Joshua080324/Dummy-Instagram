const { Chat, Message, User, Sequelize } = require("../models");
const { Op } = Sequelize;
const { askGemini } = require("../helpers/aiHelper");

class ChatController {
    static async createOrGetChat(req, res, next) {
        try {
            const { partnerId } = req.body;
            const userId = req.user.id;

            if (partnerId == userId) {
                throw { name: "BadRequest", message: "You cannot create a chat with yourself." };
            }

            const [chat, created] = await Chat.findOrCreate({
                where: {
                    [Op.or]: [
                        { UserId: userId, partnerId: partnerId },
                        { UserId: partnerId, partnerId: userId },
                    ],
                    isAIChat: false
                },
                defaults: {
                    UserId: userId,
                    partnerId: partnerId,
                },
            });

            res.status(created ? 201 : 200).json(chat);
        } catch (err) {
            next(err);
        }
    }

    static async getUserChats(req, res, next) {
        try {
            const userId = req.user.id;
            const chats = await Chat.findAll({
                where: {
                    [Op.or]: [{ UserId: userId }, { partnerId: userId }],
                },
                include: [
                    { model: User, as: "creator", attributes: ["id", "username", "email"], required: false },
                    { model: User, as: "partner", attributes: ["id", "username", "email"], required: false },
                ],
                order: [["updatedAt", "DESC"]],
            });

            res.json(chats);
        } catch (err) {
            next(err);
        }
    }

    static async getChatMessages(req, res, next) {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;

            const chat = await Chat.findByPk(chatId);
            if (!chat || (chat.UserId !== userId && chat.partnerId !== userId)) {
                throw { name: "Forbidden" };
            }

            const messages = await Message.findAll({
                where: { ChatId: chatId },
                include: [{ model: User, as: "sender", attributes: ["id", "username"] }],
                order: [["createdAt", "ASC"]],
            });

            res.json(messages);
        } catch (err) {
            next(err);
        }
    }

    static async createAIChat(req, res, next) {
        try {
            const userId = req.user.id;
            const [chat, created] = await Chat.findOrCreate({
                where: {
                    UserId: userId,
                    isAIChat: true,
                },
                defaults: {
                    UserId: userId,
                    isAIChat: true,
                    partnerId: null,
                },
            });
            res.status(created ? 201 : 200).json(chat);
        } catch (err) {
            next(err);
        }
    }

    // Menambahkan validasi keamanan & menyederhanakan
    static async sendMessage(req, res, next) {
        try {
            const { chatId } = req.params;
            const { content } = req.body;
            const userId = req.user.id;
            const io = req.app.get("socketio");

            const chat = await Chat.findByPk(chatId);
            if (!chat) {
                throw { name: "NotFound", message: "Chat not found" };
            }

            const isAuthorized = chat.UserId === userId || chat.partnerId === userId;
            if (!isAuthorized) {
                throw { name: "Forbidden", message: "You are not authorized to access this chat" };
            }

            const userMessage = await Message.create({
                ChatId: chatId,
                senderId: userId,
                content,
            });
            io.to(`chat_${chatId}`).emit("receive_message", userMessage);

            if (chat.isAIChat) {
                const aiResponseText = await askGemini(content);
                const aiMessage = await Message.create({
                    ChatId: chatId,
                    senderId: null,
                    content: aiResponseText,
                });

                io.to(`chat_${chatId}`).emit("receive_message", aiMessage);
                return res.status(201).json(aiMessage);
            } else {
                return res.status(201).json(userMessage);
            }

        } catch (err) {
            next(err);
        }
    }
}

module.exports = ChatController;