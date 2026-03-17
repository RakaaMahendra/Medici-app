const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const { getAll, adjust, getLogs } = require("../controllers/stockController");

router.get("/", getAll);
router.post("/adjust", auth, adjust);
router.get("/logs", getLogs);

module.exports = router;
