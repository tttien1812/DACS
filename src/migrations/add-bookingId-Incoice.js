module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Invoices", "bookingId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Invoices", "bookingId");
  },
};
