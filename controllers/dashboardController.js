const { getDashboard } = require("../services/dashboardService");

async function dashboard(req, res, next) {
  try {
    const data = await getDashboard();

    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  dashboard,
};
