"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProductionItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductionItem.belongsTo(models.Production, {
        foreignKey: "productionId",
      });

      ProductionItem.belongsTo(models.Material, {
        foreignKey: "materialId",
      });
    }
  }
  ProductionItem.init(
    {
      productionId: DataTypes.INTEGER,
      materialId: DataTypes.INTEGER,
      qtyUsed: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "ProductionItem",
    }
  );
  return ProductionItem;
};
