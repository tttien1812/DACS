import { v4 as uuidv4 } from "uuid";
import db from "../models/index";
require("dotenv").config();
import emailService from "./emailService";

let buildUrlEmail = (doctorID, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorID=${doctorID}`;
  return result;
};

let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorID ||
        !data.timeType ||
        !data.date ||
        !data.fullname ||
        !data.selectedGender ||
        !data.address ||
        !data.animal
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required Parameter!",
        });
      } else {
        let token = uuidv4();

        await emailService.sendSimpleEmail({
          reciverEmail: data.email,
          patientName: data.fullname,
          time: data.timeString,
          doctorName: data.doctorName,
          petName: data.animal,
          language: data.language,
          redirectLink: buildUrlEmail(data.doctorID, token),
        });

        //upsert patient
        let user = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
            gender: data.selectedGender,
            address: data.address,
            firstName: data.fullname,
            //fix theem animal sua lai model user
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
              token: token,
              animal: data.animal,
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

let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorID) {
        resolve({
          errCode: 1,
          errMessage: "Missing required Parameter!",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorID: data.doctorID,
            token: data.token,
            statusID: "S1",
          },
          raw: false,
        });
        if (appointment) {
          // await appointment.save({
          //   statusID: "S2",
          // });
          appointment.statusID = "S2";
          await appointment.save();
          resolve({
            errCode: 0,
            errMessage: "Update the Appointment succeed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "You already have an existing appointment!",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getBookingHistory = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!email) {
        resolve({
          errCode: 1,
          errMessage: "Missing required Parameter!",
        });
      } else {
        let user = await db.User.findOne({ where: { email } });
        if (!user) {
          resolve({
            errCode: 2,
            errMessage: "User not found!",
          });
        } else {
          let bookings = await db.Booking.findAll({
            where: { patientID: user.id, statusID: "S2" },
            include: [
              {
                model: db.User,
                as: "patientData",
                attributes: ["firstName", "lastName", "phoneNumber", "email"],
              },
              {
                model: db.User,
                as: "doctorData",
                attributes: ["firstName", "lastName"],
              },
              {
                model: db.Allcode,
                as: "timeTypeDataPatient",
                attributes: ["valueVI", "valueEN"],
              },
            ],
            raw: false,
            nest: true,
          });
          resolve({
            errCode: 0,
            data: bookings,
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  getBookingHistory: getBookingHistory,
};
