"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Invoices", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      userId: {
        type: Sequelize.INTEGER,
      },

      petId: {
        type: Sequelize.INTEGER,
      },

      doctorId: {
        type: Sequelize.INTEGER,
      },

      totalPrice: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },

      paymentStatus: {
        type: Sequelize.STRING,
        defaultValue: "pending",
      },

      note: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("Invoices");
  },
};
