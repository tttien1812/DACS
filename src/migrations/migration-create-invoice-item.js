"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("InvoiceItems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      invoiceId: {
        type: Sequelize.INTEGER,
      },

      medicineId: {
        type: Sequelize.INTEGER,
      },

      name: {
        type: Sequelize.STRING,
      },

      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },

      price: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },

      total: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("InvoiceItems");
  },
};
