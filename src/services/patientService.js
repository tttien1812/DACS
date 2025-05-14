import db from "../models/index";
require("dotenv").config();

let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.doctorID || !data.timeType || !data.date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required Parameter!",
        });
      } else {
        //upsert patient
        let user = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
          },
        });

        //create a booking record
        if (user[0]) {
          await db.Booking.findOrCreate({
            where: { patientID: user[0].id },
            defaults: {
              statusID: "S1",
              doctorID: data.doctorID,
              patientID: user[0].id,
              date: data.date,
              timeType: data.timeType,
            },
          });
        }

        resolve({
          errCode: 0,
          errMessage: "Save infor succeed",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  postBookAppointment: postBookAppointment,
};
