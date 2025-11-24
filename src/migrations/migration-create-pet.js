"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Pets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: { type: Sequelize.STRING },
      species: { type: Sequelize.STRING },
      breed: { type: Sequelize.STRING },
      birthday: { type: Sequelize.STRING },
      weight: { type: Sequelize.FLOAT },
      gender: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      ownerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable("Pets");
  },
};
