"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Recipe.belongsTo(models.Product, {
        foreignKey: "productId",
      });

      Recipe.hasMany(models.RecipeItem, {
        foreignKey: "recipeId",
      });
    }
  }
  Recipe.init(
    {
      productId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Recipe",
    }
  );
  return Recipe;
};
