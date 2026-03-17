const { Material, MaterialPrice, Supplier } = require("../models");

async function getAllMaterials() {
  return await Material.findAll({
    include: {
      model: MaterialPrice,
      include: [Supplier],
    },
    order: [["createdAt", "DESC"]],
  });
}

async function getMaterialById(id) {
  const material = await Material.findByPk(id, {
    include: {
      model: MaterialPrice,
      include: [Supplier],
    },
  });
  if (!material) throw new Error("Material not found");
  return material;
}

async function createMaterial(data) {
  return await Material.create(data);
}

async function updateMaterial(id, data) {
  const material = await Material.findByPk(id);
  if (!material) throw new Error("Material not found");
  await material.update(data);
  return material;
}

async function deleteMaterial(id) {
  const material = await Material.findByPk(id);
  if (!material) throw new Error("Material not found");
  await material.destroy();
  return true;
}

// Material Price management
async function createMaterialPrice(data) {
  return await MaterialPrice.create(data);
}

async function updateMaterialPrice(id, data) {
  const mp = await MaterialPrice.findByPk(id);
  if (!mp) throw new Error("MaterialPrice not found");
  await mp.update(data);
  return mp;
}

async function deleteMaterialPrice(id) {
  const mp = await MaterialPrice.findByPk(id);
  if (!mp) throw new Error("MaterialPrice not found");
  await mp.destroy();
  return true;
}

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  createMaterialPrice,
  updateMaterialPrice,
  deleteMaterialPrice,
};
