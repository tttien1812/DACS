"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BookingImage extends Model {
    static associate(models) {
      BookingImage.belongsTo(models.Booking, {
        foreignKey: "bookingId",
        as: "booking",
      });
    }
  }

  BookingImage.init(
    {
      bookingId: DataTypes.INTEGER,
      imageUrl: DataTypes.BLOB("long"),
    },
    {
      sequelize,
      modelName: "BookingImage",
    }
  );

  return BookingImage;
};
