// migrations/YYYYMMDDHHmmss-add-animal-to-bookings.js
"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("bookings", "animal", {
      type: Sequelize.STRING,
      allowNull: true, // Cho phép null nếu cần
    });
    await queryInterface.addConstraint("bookings", {
      fields: ["patientID"],
      type: "foreign key",
      name: "fk_bookings_patientID",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("bookings", {
      fields: ["doctorID"],
      type: "foreign key",
      name: "fk_bookings_doctorID",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("bookings", "fk_bookings_patientID");
    await queryInterface.removeConstraint("bookings", "fk_bookings_doctorID");
    await queryInterface.removeColumn("bookings", "animal");
  },
};
