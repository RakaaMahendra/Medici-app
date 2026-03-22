const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

const { create, getReport } = require("../controllers/productionController");

router.post("/", auth, role("staff"), create);
router.get("/", auth, role("admin", "user"), getReport);

module.exports = router;
