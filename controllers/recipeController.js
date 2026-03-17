const {
  getAllRecipes,
  getRecipeByProductId,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require("../services/recipeService");

async function getAll(req, res, next) {
  try {
    const data = await getAllRecipes();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getByProduct(req, res, next) {
  try {
    const data = await getRecipeByProductId(req.params.productId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await createRecipe(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateRecipe(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await deleteRecipe(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getByProduct, create, update, remove };
