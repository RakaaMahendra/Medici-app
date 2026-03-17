const { Supplier, MaterialPrice, Material } = require("../models");

async function getAllSuppliers() {
  return await Supplier.findAll({
    include: {
      model: MaterialPrice,
      include: [Material],
    },
    order: [["createdAt", "DESC"]],
  });
}

async function getSupplierById(id) {
  const supplier = await Supplier.findByPk(id, {
    include: {
      model: MaterialPrice,
      include: [Material],
    },
  });
  if (!supplier) throw new Error("Supplier not found");
  return supplier;
}

async function createSupplier(data) {
  return await Supplier.create(data);
}

async function updateSupplier(id, data) {
  const supplier = await Supplier.findByPk(id);
  if (!supplier) throw new Error("Supplier not found");
  await supplier.update(data);
  return supplier;
}

async function deleteSupplier(id) {
  const supplier = await Supplier.findByPk(id);
  if (!supplier) throw new Error("Supplier not found");
  await supplier.destroy();
  return true;
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
