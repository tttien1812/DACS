"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Pet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Một User có nhiều Pet
      Pet.belongsTo(models.User, { foreignKey: "ownerId", as: "owner" });

      // Một Pet có thể có nhiều Booking
      Pet.hasMany(models.Booking, { foreignKey: "petId", as: "petBookings" });

      Pet.belongsTo(models.Allcode, {
        foreignKey: "species",
        targetKey: "keyMap",
        as: "speciesData",
      });

      Pet.belongsTo(models.Allcode, {
        foreignKey: "gender",
        targetKey: "keyMap",
        as: "genderData",
      });

      Pet.belongsTo(models.Allcode, {
        foreignKey: "birthday",
        targetKey: "keyMap",
        as: "ageData",
      });
    }
  }

  Pet.init(
    {
      name: DataTypes.STRING,
      species: DataTypes.STRING,
      breed: DataTypes.STRING,
      birthday: DataTypes.STRING,
      weight: DataTypes.FLOAT,
      gender: DataTypes.STRING,
      status: DataTypes.STRING,
      ownerId: DataTypes.INTEGER,
      image: DataTypes.STRING,
      isPrescribed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Pet",
    }
  );

  return Pet;
};
