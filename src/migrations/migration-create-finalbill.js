"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("FinalBills", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      userId: {
        type: Sequelize.INTEGER,
      },

      bookingId: {
        type: Sequelize.INTEGER,
      },

      invoiceId: {
        type: Sequelize.INTEGER,
      },

      examinationFee: {
        type: Sequelize.FLOAT,
      },

      medicineFee: {
        type: Sequelize.FLOAT,
      },

      depositAmount: {
        type: Sequelize.FLOAT,
      },

      finalAmount: {
        type: Sequelize.FLOAT,
      },

      remainingAmount: {
        type: Sequelize.FLOAT,
      },

      status: {
        type: Sequelize.STRING,
        defaultValue: "pending",
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
    await queryInterface.dropTable("FinalBills");
  },
};
