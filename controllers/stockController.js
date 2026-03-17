const {
  getAllStocks,
  adjustStock,
  getStockLogs,
} = require("../services/stockService");

async function getAll(req, res, next) {
  try {
    const data = await getAllStocks();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function adjust(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await adjustStock({ ...req.body, userId });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getLogs(req, res, next) {
  try {
    const data = await getStockLogs(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, adjust, getLogs };
