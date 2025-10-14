const { verifyToken } = require("./jwt");
const { User } = require("../models");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw { name: "Unauthorized" };

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);
    if (!user) throw { name: "Unauthorized" };

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized access" });
  }
};
