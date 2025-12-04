"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ZaloPayPayment extends Model {
    static associate(models) {
      ZaloPayPayment.belongsTo(models.Booking, {
        foreignKey: "bookingId",
        targetKey: "id",
        as: "bookingData",
      });
      ZaloPayPayment.belongsTo(models.User, {
        foreignKey: "userId",
        targetKey: "id",
        as: "userData",
      });
    }
  }

  ZaloPayPayment.init(
    {
      bookingId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,

      amount: DataTypes.FLOAT, // số tiền khách đã thanh toán trước
      status: DataTypes.STRING, // success | pending | failed
      zpTransId: DataTypes.STRING, // mã giao dịch từ ZaloPay
      orderId: DataTypes.STRING, // app_trans_id
      description: DataTypes.TEXT,
    },
    { sequelize, modelName: "ZaloPayPayment" }
  );

  return ZaloPayPayment;
};
