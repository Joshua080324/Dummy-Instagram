'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Chat.belongsTo(models.User, { as: "creator", foreignKey: "UserId" }); 
      Chat.belongsTo(models.User, { as: "partner", foreignKey: "partnerId" });
      Chat.hasMany(models.Message);
    }

  }
  Chat.init({
    isAIChat: DataTypes.BOOLEAN,
    UserId: DataTypes.INTEGER,
    partnerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};