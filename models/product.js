"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.hasOne(models.Recipe, {
        foreignKey: "productId",
      });

      Product.hasMany(models.Production, {
        foreignKey: "productId",
      });

      Product.hasOne(models.Stock, {
        foreignKey: "productId",
      });

      Product.hasMany(models.SaleItem, {
        foreignKey: "productId",
      });
    }
  }
  Product.init(
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      price: DataTypes.FLOAT,
      image: DataTypes.STRING,
      cogs: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
