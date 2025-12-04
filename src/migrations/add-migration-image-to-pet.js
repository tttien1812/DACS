"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Pets", "image", {
      type: Sequelize.STRING,
      allowNull: true, // Cho phép null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Pets", "image");
  },
};
