const {
  Production,
  ProductionItem,
  Recipe,
  RecipeItem,
  Stock,
  StockLog,
  Product,
  Material,
  sequelize,
} = require("../models");
async function createProduction(data) {
  const t = await sequelize.transaction();

  try {
    const { productId, qty, items, userId } = data;

    if (!productId) {
      throw new Error("productId required");
    }

    if (!qty || qty <= 0) {
      throw new Error("qty must be > 0");
    }

    if (!items || items.length === 0) {
      throw new Error("items required");
    }

    const production = await Production.create(
      {
        productId,
        qty,
        userId,
        date: new Date(),
      },
      { transaction: t }
    );

    for (const item of items) {
      if (!item.materialId) {
        throw new Error("materialId required");
      }

      if (!item.qtyUsed) {
        throw new Error("qtyUsed required");
      }
      await ProductionItem.create(
        {
          productionId: production.id,
          materialId: item.materialId,
          qtyUsed: item.qtyUsed,
        },
        { transaction: t }
      );
    }

    let stock = await Stock.findOne({
      where: { productId },
      transaction: t,
    });

    if (!stock) {
      stock = await Stock.create(
        {
          productId,
          qty,
        },
        { transaction: t }
      );
    } else {
      stock.qty += qty;

      await stock.save({ transaction: t });
    }

    await StockLog.create(
      {
        stockId: stock.id,
        productId,
        qty,
        type: "production",
        reason: "Production result",
        userId,
      },
      { transaction: t }
    );

    await t.commit();

    return production;
  } catch (err) {
    await t.rollback();

    throw err;
  }
}

async function compareWithRecipe(productId, qty, items) {
  const recipe = await Recipe.findOne({
    where: { productId },
    include: {
      model: RecipeItem,
      include: [Material],
    },
  });

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  let result = [];

  for (const r of recipe.RecipeItems) {
    const expected = r.qty * qty;

    const usedItem = items.find((i) => i.materialId === r.materialId);

    const used = usedItem ? usedItem.qtyUsed : 0;

    const diff = used - expected;

    result.push({
      materialId: r.materialId,
      materialName: r.Material ? r.Material.name : `Material #${r.materialId}`,
      unit: r.Material ? r.Material.unit : "",
      expected,
      used,
      diff,
    });
  }

  return result;
}

const { Op } = require("sequelize");

async function getProductionReport({
  page = 1,
  limit = 10,
  date,
  startDate,
  endDate,
}) {
  const offset = (page - 1) * limit;

  let where = {};

  // filter 1 date

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    where.date = {
      [Op.between]: [start, end],
    };
  }

  // filter range

  if (startDate && endDate) {
    where.date = {
      [Op.between]: [new Date(startDate), new Date(endDate)],
    };
  }

  const productions = await Production.findAll({
    where,

    include: [
      {
        model: Product,
        include: [
          {
            model: Recipe,
            include: [RecipeItem],
          },
        ],
      },
      {
        model: ProductionItem,
        include: [Material],
      },
    ],

    limit,
    offset,

    order: [["createdAt", "DESC"]],
  });

  const result = [];

  for (const prod of productions) {
    const recipeItems = prod.Product.Recipe?.RecipeItems || [];

    const items = [];

    for (const pItem of prod.ProductionItems) {
      const recipe = recipeItems.find((r) => r.materialId === pItem.materialId);

      const expected = recipe ? recipe.qty * prod.qty : 0;

      const used = pItem.qtyUsed;

      const diff = used - expected;

      items.push({
        material: pItem.Material.name,
        unit: pItem.Material.unit || "",
        expected,
        used,
        diff,
        diffPercent: expected > 0 ? ((diff / expected) * 100).toFixed(1) : null,
      });
    }

    result.push({
      id: prod.id,
      product: prod.Product.name,
      qty: prod.qty,
      date: prod.date,
      items,
    });
  }

  return result;
}

module.exports = {
  createProduction,
  compareWithRecipe,
  getProductionReport,
};
