const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const {
  getAll,
  getOne,
  create,
  update,
  remove,
  addPrice,
  editPrice,
  removePrice,
} = require("../controllers/materialController");

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", auth, create);
router.put("/:id", auth, update);
router.delete("/:id", auth, remove);

// Material Prices
router.post("/prices", auth, addPrice);
router.put("/prices/:priceId", auth, editPrice);
router.delete("/prices/:priceId", auth, removePrice);

module.exports = router;
