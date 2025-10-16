const { Chat, Message, User, Sequelize } = require("../models");
const { Op } = Sequelize;
const { askGemini } = require("../helpers/aiHelper");

class ChatController {
    // Mencegah duplikasi chat
    static async createOrGetChat(req, res, next) {
        try {
            const { partnerId } = req.body;
            const userId = req.user.id;

            if (partnerId == userId) { //  Validasi agar tidak chat dengan diri sendiri
                throw { name: "BadRequest", message: "You cannot create a chat with yourself." };
            }

            // Cari chat yang sudah ada antara kedua user
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

    // Menampilkan semua chat dimana user terlibat
    static async getUserChats(req, res, next) {
        try {
            const userId = req.user.id;
            const chats = await Chat.findAll({
                where: {
                    [Op.or]: [{ UserId: userId }, { partnerId: userId }],
                },
                include: [
                    { model: User, as: "creator", attributes: ["id", "username", "profilePic"] },
                    { model: User, as: "partner", attributes: ["id", "username", "profilePic"] },
                ],
                order: [["updatedAt", "DESC"]],
            });

            res.json(chats);
        } catch (err) {
            next(err);
        }
    }

    // Menambahkan validasi keamanan
    static async getChatMessages(req, res, next) {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;

            // Validasi: Pastikan user adalah bagian dari chat ini
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
                    partnerId: null, // Tidak ada partner untuk AI chat
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

            // Pesan dari user tetap dibuat
            const userMessage = await Message.create({
                ChatId: chatId,
                senderId: userId,
                content,
            });
            io.to(`chat_${chatId}`).emit("receive_message", userMessage);

            // --- PERUBAHAN UTAMA UNTUK POSTMAN ---
            if (chat.isAIChat) {
                // 1. Panggil Gemini dan TUNGGU (await) sampai ada jawaban
                const aiResponseText = await askGemini(content);

                // 2. Simpan jawaban AI ke database
                const aiMessage = await Message.create({
                    ChatId: chatId,
                    senderId: null, // AI tidak punya ID
                    content: aiResponseText,
                });

                // 3. Kirim juga jawaban AI via socket untuk klien web
                io.to(`chat_${chatId}`).emit("receive_message", aiMessage);

                // 4. Kirim JAWABAN AI sebagai respons HTTP ke Postman
                return res.status(201).json(aiMessage);

            } else {
                // Untuk chat biasa, kembalikan pesan user seperti biasa
                return res.status(201).json(userMessage);
            }

        } catch (err) {
            next(err);
        }
    }
}

module.exports = ChatController;