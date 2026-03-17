"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MaterialPrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MaterialPrice.belongsTo(models.Supplier, {
        foreignKey: "supplierId",
      });

      MaterialPrice.belongsTo(models.Material, {
        foreignKey: "materialId",
      });
    }
  }
  MaterialPrice.init(
    {
      materialId: DataTypes.INTEGER,
      supplierId: DataTypes.INTEGER,
      price: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "MaterialPrice",
    }
  );
  return MaterialPrice;
};
