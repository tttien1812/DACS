"use strict";

const { toDefaultValue } = require("sequelize/lib/utils");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("doctor_infor", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      doctorID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      specialtyID: {
        type: Sequelize.INTEGER,
      },
      clinicID: {
        type: Sequelize.INTEGER,
      },
      priceID: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provinceID: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paymentID: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      addressClinic: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nameClinic: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      note: {
        type: Sequelize.STRING,
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("doctor_infor");
  },
};
