"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    // SUPPLIERS
    await queryInterface.bulkInsert("Suppliers", [
      {
        name: "PT CBA",
        phone: "0811",
        address: "Bandung",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "PT XYZ",
        phone: "0822",
        address: "Jakarta",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // MATERIALS
    await queryInterface.bulkInsert("Materials", [
      {
        name: "Ginseng",
        unit: "kg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Jahe",
        unit: "kg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // MATERIAL PRICES
    await queryInterface.bulkInsert("MaterialPrices", [
      {
        materialId: 1,
        supplierId: 1,
        price: 100000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        materialId: 1,
        supplierId: 2,
        price: 120000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        materialId: 2,
        supplierId: 1,
        price: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // PRODUCT
    await queryInterface.bulkInsert("Products", [
      {
        name: "Jamu Kuat",
        price: 20000,
        image: "jamu.jpg",
        cogs: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // RECIPE
    await queryInterface.bulkInsert("Recipes", [
      {
        productId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // RECIPE ITEMS
    await queryInterface.bulkInsert("RecipeItems", [
      {
        recipeId: 1,
        materialId: 1,
        qty: 0.1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        recipeId: 1,
        materialId: 2,
        qty: 0.2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("RecipeItems", null, {});
    await queryInterface.bulkDelete("Recipes", null, {});
    await queryInterface.bulkDelete("Products", null, {});
    await queryInterface.bulkDelete("MaterialPrices", null, {});
    await queryInterface.bulkDelete("Materials", null, {});
    await queryInterface.bulkDelete("Suppliers", null, {});
  },
};
