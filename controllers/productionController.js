const {
  createProduction,
  compareWithRecipe,
  getProductionReport,
} = require("../services/productionService");

async function create(req, res, next) {
  try {
    const data = req.body;

    const userId = req.user.id;

    const production = await createProduction({
      ...data,
      userId,
    });

    const compare = await compareWithRecipe(
      data.productId,
      data.qty,
      data.items
    );

    res.json({
      production,
      compare,
    });
  } catch (err) {
    next(err);
  }
}
async function getReport(req, res, next) {
  try {
    const { page, limit, date, startDate, endDate } = req.query;

    const data = await getProductionReport({
      page,
      limit,
      date,
      startDate,
      endDate,
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
}
module.exports = {
  create,
  getReport,
};
