const { verifyToken } = require("./jwt");
const { User } = require("../models");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
      throw { name: "Unauthorized", message: "Please login first" };
    }

    const token = tokenHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);
    if (!user) throw { name: "Unauthorized", message: "User not found" };

    req.user = user;
    req.userId = decoded.id;
    next();
  } catch (err) {
    if (err.name === "Unauthorized") {
      next(err);
    } else if (err.message === "Database error") {
      next({ name: "Internal Server Error", message: err.message });
    } else {
      next({ name: "Unauthorized", message: "Please login first" });
    }
  }
};
