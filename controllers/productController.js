const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateCOGS,
} = require("../services/productService");

async function getCOGS(req, res, next) {
  try {
    const productId = req.params.productId;

    const total = await updateCOGS(productId);

    res.json({
      cogs: total,
    });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const data = await getAllProducts();

    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const data = await getProductById(req.params.id);

    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await createProduct(req.body);

    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateProduct(req.params.id, req.body);

    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await deleteProduct(req.params.id);

    res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
}

async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    const imagePath = `/uploads/${req.file.filename}`;
    const data = await updateProduct(req.params.id, { image: imagePath });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCOGS,
  getAll,
  getOne,
  create,
  update,
  remove,
  uploadImage,
};
