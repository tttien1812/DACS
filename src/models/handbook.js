"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Handbook extends Model {
    static associate(models) {
      // Có thể thêm quan hệ với Doctor_Infor nếu cần
    }
  }
  Handbook.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.TEXT,
      descriptionHTML: DataTypes.TEXT,
      descriptionMarkdown: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Handbook",
    }
  );
  return Handbook;
};
