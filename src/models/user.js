"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Allcode, {
        foreignKey: "positionId",
        targetKey: "keyMap",
        as: "positionData",
      });
      User.belongsTo(models.Allcode, {
        foreignKey: "gender",
        targetKey: "keyMap",
        as: "genderData",
      });
      User.hasOne(models.Markdown, {
        foreignKey: "doctorId",
      });
      User.hasOne(models.Doctor_Infor, {
        foreignKey: "doctorID",
        as: "doctorInfo",
      });
      User.hasMany(models.Schedule, {
        foreignKey: "doctorID",
        as: "doctorData",
      });
      User.hasMany(models.Booking, {
        foreignKey: "patientID",
        as: "patientData",
      });
      User.belongsTo(models.Specialty, {
        foreignKey: "specialtyId",
        targetKey: "id",
        as: "specialtyData",
      });
      User.hasMany(models.Pet, { foreignKey: "ownerId", as: "petList" });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      address: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      gender: DataTypes.STRING,
      image: DataTypes.STRING,
      roleId: DataTypes.STRING,
      positionId: DataTypes.STRING,

      // Mới:
      status: {
        type: DataTypes.STRING,
        defaultValue: "PENDING",
      },
      interview_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      university: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expectation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      specialtyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
