"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SaleItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SaleItem.belongsTo(models.Sale, {
        foreignKey: "saleId",
      });

      SaleItem.belongsTo(models.Product, {
        foreignKey: "productId",
      });
    }
  }
  SaleItem.init(
    {
      saleId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      qty: DataTypes.FLOAT,
      price: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "SaleItem",
    }
  );
  return SaleItem;
};
