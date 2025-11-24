"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // định danh các mối quan hệ
      Booking.belongsTo(models.User, {
        foreignKey: "patientID",
        targetKey: "id",
        as: "patientData",
      });

      Booking.belongsTo(models.Allcode, {
        foreignKey: "timeType",
        targetKey: "keyMap",
        as: "timeTypeDataPatient",
      });

      Booking.belongsTo(models.User, {
        foreignKey: "doctorID",
        targetKey: "id",
        as: "doctorData", // PHẢI có nếu muốn hiển thị tên bác sĩ
      });

      Booking.belongsTo(models.Allcode, {
        foreignKey: "statusID",
        targetKey: "keyMap",
        as: "statusData",
      });

      Booking.belongsTo(models.Pet, { foreignKey: "petId", as: "petData" });
    }
  }
  Booking.init(
    {
      statusID: DataTypes.STRING,
      doctorID: DataTypes.INTEGER,
      patientID: DataTypes.INTEGER,
      date: DataTypes.STRING,
      timeType: DataTypes.STRING,
      token: DataTypes.STRING,
      animal: DataTypes.STRING,
      petId: DataTypes.INTEGER,
      reason: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Booking",
    }
  );
  return Booking;
};
