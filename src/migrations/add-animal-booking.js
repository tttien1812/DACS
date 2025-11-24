// // migrations/YYYYMMDDHHmmss-add-animal-to-bookings.js
// "use strict";
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.addColumn("bookings", "animal", {
//       type: Sequelize.STRING,
//       allowNull: true, // Cho phép null nếu cần
//     });
//     await queryInterface.addConstraint("bookings", {
//       fields: ["patientID"],
//       type: "foreign key",
//       name: "fk_bookings_patientID",
//       references: {
//         table: "Users",
//         field: "id",
//       },
//       onDelete: "SET NULL",
//       onUpdate: "CASCADE",
//     });
//     await queryInterface.addConstraint("bookings", {
//       fields: ["doctorID"],
//       type: "foreign key",
//       name: "fk_bookings_doctorID",
//       references: {
//         table: "Users",
//         field: "id",
//       },
//       onDelete: "SET NULL",
//       onUpdate: "CASCADE",
//     });
//   },
//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.removeConstraint("bookings", "fk_bookings_patientID");
//     await queryInterface.removeConstraint("bookings", "fk_bookings_doctorID");
//     await queryInterface.removeColumn("bookings", "animal");
//   },
// };

// migrations/YYYYMMDDHHmmss-add-animal-to-bookings.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable("bookings");

    // Thêm cột animal nếu chưa tồn tại
    if (!tableDefinition.animal) {
      await queryInterface.addColumn("bookings", "animal", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Thêm FK patientID nếu chưa tồn tại
    const [patientConstraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME 
       FROM information_schema.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'patientID' AND CONSTRAINT_SCHEMA = DATABASE();`
    );
    if (
      !patientConstraints.find(
        (c) => c.CONSTRAINT_NAME === "fk_bookings_patientID"
      )
    ) {
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
    }

    // Thêm FK doctorID nếu chưa tồn tại
    const [doctorConstraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME 
       FROM information_schema.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'doctorID' AND CONSTRAINT_SCHEMA = DATABASE();`
    );
    if (
      !doctorConstraints.find(
        (c) => c.CONSTRAINT_NAME === "fk_bookings_doctorID"
      )
    ) {
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
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa constraint nếu tồn tại
    await queryInterface
      .removeConstraint("bookings", "fk_bookings_patientID")
      .catch(() => {});
    await queryInterface
      .removeConstraint("bookings", "fk_bookings_doctorID")
      .catch(() => {});

    // Xóa cột animal nếu tồn tại
    const tableDefinition = await queryInterface.describeTable("bookings");
    if (tableDefinition.animal) {
      await queryInterface.removeColumn("bookings", "animal");
    }
  },
};
