"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StockLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StockLog.belongsTo(models.Stock, {
        foreignKey: "stockId",
      });

      StockLog.belongsTo(models.Product, {
        foreignKey: "productId",
      });
    }
  }
  StockLog.init(
    {
      stockId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      qty: DataTypes.FLOAT,
      type: DataTypes.STRING,
      reason: DataTypes.STRING,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "StockLog",
    }
  );
  return StockLog;
};
