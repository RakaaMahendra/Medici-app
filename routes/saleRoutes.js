const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { create, getReport } = require("../controllers/saleController");

router.post("/", auth, role("staff"), create);
router.get("/", getReport);

module.exports = router;
