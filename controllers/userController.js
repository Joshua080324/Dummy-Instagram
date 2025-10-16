const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { signToken } = require('../helpers/jwt');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();


class UserController {
    static async register(req, res, next) {
        try {
            const { username, email, password } = req.body;
            const newUser = await User.create({ username, email, password });
            res.status(201).json({
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            });
        } catch (err) {
            next(err);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw { name: 'BadRequest', message: 'Email and password are required' };
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw { name: 'InvalidLogin' };
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) {
                throw { name: 'InvalidLogin' };
            }

            const token = signToken({ id: user.id });
            res.status(200).json({ access_token: token });
        } catch (err) {
            next(err);
        }
    }

    static async googleSignIn(req, res, next) {
        try {
            const { google_token } = req.body;

            const ticket = await client.verifyIdToken({
                idToken: google_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();

            const [user, created] = await User.findOrCreate({
                where: { email: payload.email },
                defaults: {
                    username: payload.name,
                    email: payload.email,
                    password: Math.random().toString(36),
                },
                hooks: false
            });

            const access_token = signToken({ id: user.id });
            res.status(200).json({ access_token });

        } catch (err) {
            next(err);
        }
    }
}

module.exports = UserController;