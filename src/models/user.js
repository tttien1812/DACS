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
      });
      User.hasMany(models.Schedule, {
        foreignKey: "doctorID",
        as: "doctorData",
      });
      User.hasMany(models.Booking, {
        foreignKey: "patientID",
        as: "patientData",
      });
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
      notification_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      admin_note: {
        type: DataTypes.TEXT,
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
