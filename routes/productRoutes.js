const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString("hex");
    cb(null, name + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const {
  getAll,
  getOne,
  create,
  update,
  remove,
  getCOGS,
  uploadImage,
} = require("../controllers/productController");

router.get("/", getAll);

router.get("/cogs/:productId", getCOGS);

router.get("/:id", getOne);

router.post("/", create);

router.put("/:id", update);

router.delete("/:id", remove);

router.post("/:id/upload", upload.single("image"), uploadImage);

module.exports = router;
