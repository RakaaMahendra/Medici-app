const {
  createSale,
  getSalesReport,
  getProductsForPOS,
} = require("../services/saleService");

async function create(req, res, next) {
  try {
    const userId = req.user.id;

    const sale = await createSale({
      ...req.body,
      userId,
    });

    res.json(sale);
  } catch (err) {
    next(err);
  }
}

async function getReport(req, res, next) {
  try {
    const { page, limit, date, startDate, endDate } = req.query;

    const data = await getSalesReport({
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

async function posProducts(req, res, next) {
  try {
    const data = await getProductsForPOS();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getReport,
  posProducts,
};
