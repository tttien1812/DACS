"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class InvoiceItem extends Model {
    static associate(models) {
      InvoiceItem.belongsTo(models.Invoice, {
        foreignKey: "invoiceId",
        targetKey: "id",
        as: "invoiceData",
      });

      InvoiceItem.belongsTo(models.Medicine, {
        foreignKey: "medicineId",
        targetKey: "id",
        as: "medicineData",
      });
    }
  }

  InvoiceItem.init(
    {
      invoiceId: DataTypes.INTEGER,
      medicineId: DataTypes.INTEGER,

      name: DataTypes.STRING, 
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "InvoiceItem",
    }
  );

  return InvoiceItem;
};
