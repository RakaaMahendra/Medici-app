const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { dashboard } = require("../controllers/dashboardController");

router.get("/", auth, role("admin", "user"), dashboard);

module.exports = router;
