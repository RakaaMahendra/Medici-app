"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Sales", "paymentMethod", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "cash",
    });
    await queryInterface.addColumn("Sales", "paymentAmount", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.addColumn("Sales", "changeAmount", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.addColumn("Sales", "customerName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Sales", "notes", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Sales", "paymentMethod");
    await queryInterface.removeColumn("Sales", "paymentAmount");
    await queryInterface.removeColumn("Sales", "changeAmount");
    await queryInterface.removeColumn("Sales", "customerName");
    await queryInterface.removeColumn("Sales", "notes");
  },
};
