"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RecipeItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RecipeItem.belongsTo(models.Recipe, {
        foreignKey: "recipeId",
      });

      RecipeItem.belongsTo(models.Material, {
        foreignKey: "materialId",
      });
    }
  }
  RecipeItem.init(
    {
      recipeId: DataTypes.INTEGER,
      materialId: DataTypes.INTEGER,
      qty: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "RecipeItem",
    }
  );
  return RecipeItem;
};
