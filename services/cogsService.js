const { Recipe, RecipeItem, MaterialPrice, Product } = require("../models");

async function calculateCOGS(productId) {
  // ambil recipe + items
  const recipe = await Recipe.findOne({
    where: { productId },
    include: {
      model: RecipeItem,
    },
  });

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  let totalCOGS = 0;

  // loop semua bahan di recipe
  for (const item of recipe.RecipeItems) {
    // cari harga TERMAHAL dari supplier
    const maxPrice = await MaterialPrice.max("price", {
      where: {
        materialId: item.materialId,
      },
    });

    if (!maxPrice) {
      throw new Error("Material price not found");
    }

    const cost = maxPrice * item.qty;

    totalCOGS += cost;
  }

  // update ke product
  await Product.update(
    { cogs: totalCOGS },
    {
      where: { id: productId },
    }
  );

  return totalCOGS;
}

module.exports = {
  calculateCOGS,
};
