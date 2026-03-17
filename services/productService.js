const { Product } = require("../models");

const { calculateCOGS } = require("./cogsService");

async function updateCOGS(productId) {
  return await calculateCOGS(productId);
}

async function getAllProducts() {
  return await Product.findAll();
}

async function getProductById(id) {
  return await Product.findByPk(id);
}

async function createProduct(data) {
  return await Product.create(data);
}

async function updateProduct(id, data) {
  const product = await Product.findByPk(id);

  if (!product) {
    throw new Error("Product not found");
  }

  await product.update(data);

  return product;
}

async function deleteProduct(id) {
  const product = await Product.findByPk(id);

  if (!product) {
    throw new Error("Product not found");
  }

  await product.destroy();

  return true;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateCOGS,
};
