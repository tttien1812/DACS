"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Doctor_Infor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // định danh các mối quan hệ
      Doctor_Infor.belongsTo(models.User, {
        foreignKey: "doctorID",
      });
      Doctor_Infor.belongsTo(models.Allcode, {
        foreignKey: "priceID",
        targetKey: "keyMap",
        as: "priceTypeData",
      });
      Doctor_Infor.belongsTo(models.Allcode, {
        foreignKey: "paymentID",
        targetKey: "keyMap",
        as: "paymentTypeData",
      });
      Doctor_Infor.belongsTo(models.Allcode, {
        foreignKey: "provinceID",
        targetKey: "keyMap",
        as: "provinceTypeData",
      });
    }
  }
  Doctor_Infor.init(
    {
      doctorID: DataTypes.INTEGER,
      specialtyID: DataTypes.INTEGER,
      clinicID: DataTypes.INTEGER,
      priceID: DataTypes.STRING,
      provinceID: DataTypes.STRING,
      paymentID: DataTypes.STRING,
      addressClinic: DataTypes.STRING,
      nameClinic: DataTypes.STRING,
      note: DataTypes.STRING,
      count: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Doctor_Infor",
      freezeTableName: true,
    }
  );
  return Doctor_Infor;
};
