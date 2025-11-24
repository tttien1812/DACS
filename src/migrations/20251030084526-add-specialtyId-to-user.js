// "use strict";

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn("Users", "specialtyId", {
//       type: Sequelize.INTEGER,
//       allowNull: true,
//       references: {
//         model: "Specialties", // Tên bảng specialties trong DB
//         key: "id",
//       },
//       onUpdate: "CASCADE",
//       onDelete: "SET NULL",
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeColumn("Users", "specialtyId");
//   },
// };

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable("Users");

    if (!tableDefinition.specialtyId) {
      await queryInterface.addColumn("Users", "specialtyId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Specialties", // Tên bảng Specialties trong DB
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable("Users");

    if (tableDefinition.specialtyId) {
      await queryInterface.removeColumn("Users", "specialtyId");
    }
  },
};
