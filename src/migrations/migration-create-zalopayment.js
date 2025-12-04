"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ZaloPayPayments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      bookingId: {
        type: Sequelize.INTEGER,
      },

      userId: {
        type: Sequelize.INTEGER,
      },

      amount: {
        type: Sequelize.FLOAT,
      },

      status: {
        type: Sequelize.STRING,
      },

      zpTransId: {
        type: Sequelize.STRING,
      },

      orderId: {
        type: Sequelize.STRING,
      },

      description: {
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
    await queryInterface.dropTable("ZaloPayPayments");
  },
};
