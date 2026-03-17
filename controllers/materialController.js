const {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  createMaterialPrice,
  updateMaterialPrice,
  deleteMaterialPrice,
} = require("../services/materialService");

async function getAll(req, res, next) {
  try {
    const data = await getAllMaterials();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const data = await getMaterialById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await createMaterial(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateMaterial(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await deleteMaterial(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
}

// Material Price
async function addPrice(req, res, next) {
  try {
    const data = await createMaterialPrice(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function editPrice(req, res, next) {
  try {
    const data = await updateMaterialPrice(req.params.priceId, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function removePrice(req, res, next) {
  try {
    await deleteMaterialPrice(req.params.priceId);
    res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  addPrice,
  editPrice,
  removePrice,
};
