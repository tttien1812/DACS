// "use strict";

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.addColumn("Users", "status", {
//       type: Sequelize.STRING,
//       allowNull: false,
//       defaultValue: "PENDING",
//     });
//     await queryInterface.addColumn("Users", "interview_at", {
//       type: Sequelize.DATE,
//       allowNull: true,
//     });
//     await queryInterface.addColumn("Users", "notification_sent", {
//       type: Sequelize.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     });
//     await queryInterface.addColumn("Users", "admin_note", {
//       type: Sequelize.TEXT,
//       allowNull: true,
//     });

//     await queryInterface.addIndex("Users", ["roleId", "status"], {
//       name: "idx_role_status",
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.removeIndex("Users", "idx_role_status");
//     await queryInterface.removeColumn("Users", "admin_note");
//     await queryInterface.removeColumn("Users", "notification_sent");
//     await queryInterface.removeColumn("Users", "interview_at");
//     await queryInterface.removeColumn("Users", "status");
//   },
// };

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable("Users");

    // Thêm cột status nếu chưa tồn tại
    if (!tableDefinition.status) {
      await queryInterface.addColumn("Users", "status", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "PENDING",
      });
    }

    // Thêm cột interview_at nếu chưa tồn tại
    if (!tableDefinition.interview_at) {
      await queryInterface.addColumn("Users", "interview_at", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // Thêm cột notification_sent nếu chưa tồn tại
    if (!tableDefinition.notification_sent) {
      await queryInterface.addColumn("Users", "notification_sent", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    // Thêm cột admin_note nếu chưa tồn tại
    if (!tableDefinition.admin_note) {
      await queryInterface.addColumn("Users", "admin_note", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    // Tạo index nếu chưa tồn tại
    const [indexes] = await queryInterface.sequelize.query(
      `SHOW INDEX FROM Users WHERE Key_name = 'idx_role_status';`
    );
    if (indexes.length === 0) {
      await queryInterface.addIndex("Users", ["roleId", "status"], {
        name: "idx_role_status",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("Users", "idx_role_status");

    const tableDefinition = await queryInterface.describeTable("Users");

    if (tableDefinition.admin_note) {
      await queryInterface.removeColumn("Users", "admin_note");
    }
    if (tableDefinition.notification_sent) {
      await queryInterface.removeColumn("Users", "notification_sent");
    }
    if (tableDefinition.interview_at) {
      await queryInterface.removeColumn("Users", "interview_at");
    }
    if (tableDefinition.status) {
      await queryInterface.removeColumn("Users", "status");
    }
  },
};
