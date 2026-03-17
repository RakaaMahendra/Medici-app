const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../services/supplierService");

async function getAll(req, res, next) {
  try {
    const data = await getAllSuppliers();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const data = await getSupplierById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await createSupplier(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateSupplier(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await deleteSupplier(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
