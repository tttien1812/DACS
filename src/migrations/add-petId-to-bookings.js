"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Bookings", "petId", {
      type: Sequelize.INTEGER,
      allowNull: true, // có thể null nếu booking cũ chưa có pet
      references: {
        model: "Pets", // tên table Pets
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Bookings", "petId");
  },
};
