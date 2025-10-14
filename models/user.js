'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Post);
      User.hasMany(models.Like);
      User.hasMany(models.Chat, { foreignKey: "UserId" });
      User.hasMany(models.Chat, { foreignKey: "partnerId" });
      User.hasMany(models.Message, { foreignKey: "senderId" });
      User.hasMany(models.Message, { foreignKey: "receiverId" });
    }

  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: `Username is required` },
        notNull: { msg: `Username is required` }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: `Email is already registered` },
      validate: {
        notEmpty: { msg: `Email is required` },
        notNull: { msg: `Email is required` },
        isEmail: { msg: `Invalid email format` }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: `Password is required` },
        notNull: { msg: `Password is required` }
      }
    },
    profilePic: {
      type: DataTypes.STRING,
    },
    bio: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  });
  return User;
};