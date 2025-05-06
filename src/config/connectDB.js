const { Sequelize } = require("sequelize");

// Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize("FurCare", "root", null, {
  //"database", "username", "password",
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

// hàm xác nhận thành công
let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = connectDB;
