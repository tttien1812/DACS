"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FinalBill extends Model {
    static associate(models) {
      FinalBill.belongsTo(models.Invoice, {
        foreignKey: "invoiceId",
        targetKey: "id",
        as: "invoiceData",
      });

      FinalBill.belongsTo(models.Booking, {
        foreignKey: "bookingId",
        targetKey: "id",
        as: "bookingData",
      });

      FinalBill.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "userData",
      });
    }
  }

  FinalBill.init(
    {
      userId: DataTypes.INTEGER,
      bookingId: DataTypes.INTEGER,
      invoiceId: DataTypes.INTEGER,

      examinationFee: DataTypes.FLOAT, // phí khám của bác sĩ
      medicineFee: DataTypes.FLOAT, // tổng từ InvoiceItems
      depositAmount: DataTypes.FLOAT, // tiền đã thanh toán trước (nếu có)
      finalAmount: DataTypes.FLOAT, // tổng cuối cùng phải trả
      remainingAmount: DataTypes.FLOAT, // tiền khách phải trả tiếp
      status: {
        type: DataTypes.STRING, // pending | paid
        defaultValue: "pending",
      },
    },
    { sequelize, modelName: "FinalBill" }
  );

  return FinalBill;
};
