"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Medicine extends Model {
    static associate(models) {
      // Medicine liên kết tới Allcode qua keyMap
      Medicine.belongsTo(models.Allcode, {
        foreignKey: "allcodeKey",
        targetKey: "id",
        as: "allcodeData",
      });
    }
  }

  Medicine.init(
    {
      allcodeKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT, // Giá mặc định
        defaultValue: 0,
      },
      description: DataTypes.TEXT, // thông tin bổ sung nếu cần
    },
    {
      sequelize,
      modelName: "Medicine",
    }
  );

  return Medicine;
};
