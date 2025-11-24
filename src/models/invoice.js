"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      // Hóa đơn thuộc về user
      Invoice.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "userData",
      });

      // Hóa đơn thuộc về pet
      Invoice.belongsTo(models.Pet, {
        foreignKey: "petId",
        targetKey: "id",
        as: "petData",
      });

      // Hóa đơn thuộc về bác sĩ
      Invoice.belongsTo(models.User, {
        foreignKey: "doctorId",
        targetKey: "id",
        as: "doctorData",
      });

      // Hóa đơn có nhiều dòng sản phẩm
      Invoice.hasMany(models.InvoiceItem, {
        foreignKey: "invoiceId",
        as: "items",
      });
    }
  }

  Invoice.init(
    {
      userId: DataTypes.INTEGER,
      petId: DataTypes.INTEGER,
      doctorId: DataTypes.INTEGER,

      totalPrice: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },

      paymentStatus: {
        type: DataTypes.STRING, // pending | paid | failed | refunded
        defaultValue: "pending",
      },

      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Invoice",
    }
  );

  return Invoice;
};
