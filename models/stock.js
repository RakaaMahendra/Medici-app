"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Stock.belongsTo(models.Product, {
        foreignKey: "productId",
      });

      Stock.hasMany(models.StockLog, {
        foreignKey: "stockId",
      });
    }
  }
  Stock.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      qty: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "Stock",
    }
  );
  return Stock;
};
