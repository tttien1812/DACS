"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa 2 cột cũ
    await queryInterface.removeColumn("Users", "notification_sent");
    await queryInterface.removeColumn("Users", "admin_note");

    // Thêm 2 cột mới
    await queryInterface.addColumn("Users", "university", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "expectation", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: xóa 2 cột mới, khôi phục cũ
    await queryInterface.removeColumn("Users", "university");
    await queryInterface.removeColumn("Users", "expectation");

    await queryInterface.addColumn("Users", "notification_sent", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn("Users", "admin_note", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
