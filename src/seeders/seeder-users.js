"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", [
      {
        email: "tttien@gmail.com",
        password: "12345",
        firstName: "Tien",
        lastName: "Truong",
        address: "BinhThuan",
        gender: 1,
        typeRole: "ROLE",
        keyRole: "R!",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
