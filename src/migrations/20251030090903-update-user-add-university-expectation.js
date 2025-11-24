// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     // Xóa 2 cột cũ
//     await queryInterface.removeColumn("Users", "notification_sent");
//     await queryInterface.removeColumn("Users", "admin_note");

//     // Thêm 2 cột mới
//     await queryInterface.addColumn("Users", "university", {
//       type: Sequelize.STRING,
//       allowNull: true,
//     });

//     await queryInterface.addColumn("Users", "expectation", {
//       type: Sequelize.TEXT,
//       allowNull: true,
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     // Rollback: xóa 2 cột mới, khôi phục cũ
//     await queryInterface.removeColumn("Users", "university");
//     await queryInterface.removeColumn("Users", "expectation");

//     await queryInterface.addColumn("Users", "notification_sent", {
//       type: Sequelize.BOOLEAN,
//       defaultValue: false,
//     });

//     await queryInterface.addColumn("Users", "admin_note", {
//       type: Sequelize.TEXT,
//       allowNull: true,
//     });
//   },
// };

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable("Users");

    // Xóa cột cũ nếu tồn tại
    if (tableDefinition.notification_sent) {
      await queryInterface.removeColumn("Users", "notification_sent");
    }
    if (tableDefinition.admin_note) {
      await queryInterface.removeColumn("Users", "admin_note");
    }

    // Thêm cột mới nếu chưa tồn tại
    if (!tableDefinition.university) {
      await queryInterface.addColumn("Users", "university", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableDefinition.expectation) {
      await queryInterface.addColumn("Users", "expectation", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable("Users");

    // Xóa 2 cột mới nếu tồn tại
    if (tableDefinition.university) {
      await queryInterface.removeColumn("Users", "university");
    }
    if (tableDefinition.expectation) {
      await queryInterface.removeColumn("Users", "expectation");
    }

    // Khôi phục 2 cột cũ nếu chưa có
    if (!tableDefinition.notification_sent) {
      await queryInterface.addColumn("Users", "notification_sent", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    if (!tableDefinition.admin_note) {
      await queryInterface.addColumn("Users", "admin_note", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },
};
