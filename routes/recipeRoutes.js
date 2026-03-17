const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const {
  getAll,
  getByProduct,
  create,
  update,
  remove,
} = require("../controllers/recipeController");

router.get("/", getAll);
router.get("/product/:productId", getByProduct);
router.post("/", auth, create);
router.put("/:id", auth, update);
router.delete("/:id", auth, remove);

module.exports = router;
