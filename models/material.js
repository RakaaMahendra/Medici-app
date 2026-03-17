"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Material extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Material.hasMany(models.MaterialPrice, {
        foreignKey: "materialId",
      });

      Material.hasMany(models.RecipeItem, {
        foreignKey: "materialId",
      });

      Material.hasMany(models.ProductionItem, {
        foreignKey: "materialId",
      });
    }
  }
  Material.init(
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      unit: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Material",
    }
  );
  return Material;
};
