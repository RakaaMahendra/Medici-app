const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const {
  create,
  getReport,
  posProducts,
} = require("../controllers/saleController");

router.get("/pos/products", auth, role("staff"), posProducts);
router.post("/", auth, role("staff"), create);
router.get("/", auth, getReport);

module.exports = router;
