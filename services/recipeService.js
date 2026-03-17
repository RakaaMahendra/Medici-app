const {
  Recipe,
  RecipeItem,
  Product,
  Material,
  sequelize,
} = require("../models");

async function getAllRecipes() {
  return await Recipe.findAll({
    include: [
      { model: Product },
      {
        model: RecipeItem,
        include: [Material],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}

async function getRecipeByProductId(productId) {
  const recipe = await Recipe.findOne({
    where: { productId },
    include: [
      { model: Product },
      {
        model: RecipeItem,
        include: [Material],
      },
    ],
  });
  if (!recipe) throw new Error("Recipe not found");
  return recipe;
}

async function createRecipe(data) {
  const t = await sequelize.transaction();
  try {
    const { productId, items } = data;

    if (!productId) throw new Error("productId required");
    if (!items || items.length === 0) throw new Error("items required");

    // Check if recipe already exists for this product
    const existing = await Recipe.findOne({
      where: { productId },
      transaction: t,
    });
    if (existing) throw new Error("Recipe already exists for this product");

    const recipe = await Recipe.create({ productId }, { transaction: t });

    for (const item of items) {
      if (!item.materialId) throw new Error("materialId required");
      if (!item.qty || item.qty <= 0) throw new Error("qty must be > 0");

      await RecipeItem.create(
        {
          recipeId: recipe.id,
          materialId: item.materialId,
          qty: item.qty,
        },
        { transaction: t }
      );
    }

    await t.commit();

    return await Recipe.findByPk(recipe.id, {
      include: [{ model: Product }, { model: RecipeItem, include: [Material] }],
    });
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

async function updateRecipe(recipeId, data) {
  const t = await sequelize.transaction();
  try {
    const { items } = data;
    const recipe = await Recipe.findByPk(recipeId, { transaction: t });
    if (!recipe) throw new Error("Recipe not found");

    // Delete old items
    await RecipeItem.destroy({ where: { recipeId }, transaction: t });

    // Create new items
    for (const item of items) {
      if (!item.materialId) throw new Error("materialId required");
      if (!item.qty || item.qty <= 0) throw new Error("qty must be > 0");

      await RecipeItem.create(
        {
          recipeId,
          materialId: item.materialId,
          qty: item.qty,
        },
        { transaction: t }
      );
    }

    await t.commit();

    return await Recipe.findByPk(recipeId, {
      include: [{ model: Product }, { model: RecipeItem, include: [Material] }],
    });
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

async function deleteRecipe(id) {
  const t = await sequelize.transaction();
  try {
    const recipe = await Recipe.findByPk(id, { transaction: t });
    if (!recipe) throw new Error("Recipe not found");
    await RecipeItem.destroy({ where: { recipeId: id }, transaction: t });
    await recipe.destroy({ transaction: t });
    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

module.exports = {
  getAllRecipes,
  getRecipeByProductId,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
