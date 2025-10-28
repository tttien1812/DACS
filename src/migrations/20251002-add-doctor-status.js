"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "PENDING",
    });
    await queryInterface.addColumn("Users", "interview_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "notification_sent", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Users", "admin_note", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addIndex("Users", ["roleId", "status"], {
      name: "idx_role_status",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("Users", "idx_role_status");
    await queryInterface.removeColumn("Users", "admin_note");
    await queryInterface.removeColumn("Users", "notification_sent");
    await queryInterface.removeColumn("Users", "interview_at");
    await queryInterface.removeColumn("Users", "status");
  },
};
