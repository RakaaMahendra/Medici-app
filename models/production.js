"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Production extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Production.belongsTo(models.Product, {
        foreignKey: "productId",
      });

      Production.hasMany(models.ProductionItem, {
        foreignKey: "productionId",
      });
    }
  }
  Production.init(
    {
      productId: DataTypes.INTEGER,
      qty: DataTypes.FLOAT,
      userId: DataTypes.INTEGER,
      date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Production",
    }
  );
  return Production;
};
