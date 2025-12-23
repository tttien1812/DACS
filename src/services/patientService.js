import { v4 as uuidv4 } from "uuid";
import db from "../models/index";
require("dotenv").config();
import emailService from "./emailService";

const { Op } = require("sequelize");

let buildUrlEmail = (doctorID, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorID=${doctorID}`;
  return result;
};

// let postBookAppointment = (data) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       if (
//         !data.email ||
//         !data.doctorID ||
//         !data.timeType ||
//         !data.date ||
//         !data.fullname ||
//         !data.selectedGender ||
//         !data.address
//       ) {
//         resolve({
//           errCode: 1,
//           errMessage: "Missing required Parameter!",
//         });
//       } else {
//         let token = uuidv4();

//         //upsert patient
//         let [user] = await db.User.findOrCreate({
//           where: { email: data.email },
//           defaults: {
//             email: data.email,
//             roleId: "R3",
//             gender: data.selectedGender,
//             address: data.address,
//             firstName: data.fullname,
//             //fix theem animal sua lai model user
//           },
//         });

//         //create a booking record
//         if (user[0]) {
//           await db.Booking.findOrCreate({
//             where: {
//               patientID: user[0].id,
//               doctorID: data.doctorID,
//               date: data.date,
//               timeType: data.timeType,
//             },
//             defaults: {
//               statusID: "S1",
//               doctorID: data.doctorID,
//               patientID: user[0].id,
//               date: data.date,
//               timeType: data.timeType,
//               token: token,
//               animal: data.animal,
//             },
//           });
//         }

//         resolve({
//           errCode: 0,
//           errMessage: "Save infor succeed",
//         });
//       }
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("===== BACKEND BOOKING DATA =====");
      console.log(data);
      console.log("VALIDATION CHECK:", {
        email: data.email,
        doctorID: data.doctorID,
        timeType: data.timeType,
        date: data.date,
        fullname: data.fullname,
        selectedGender: data.selectedGender,
        address: data.address,
      });
      // ===================== CHECK REQUIRED BOOKING FIELDS =====================
      if (
        !data.email ||
        !data.doctorID ||
        !data.timeType ||
        !data.date ||
        !data.fullname ||
        !data.selectedGender ||
        !data.address
      ) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required booking fields",
        });
      }

      // ===================== UPSERT USER =====================
      let [user] = await db.User.findOrCreate({
        where: { email: data.email },
        defaults: {
          email: data.email,
          roleId: "R3",
          gender: data.selectedGender,
          address: data.address,
          firstName: data.fullname,
          phoneNumber: data.phoneNumber,
        },
      });

      // ===================== CREATE PET IF PROVIDED =====================
      let petId = null;

      if (data.pet) {
        if (data.pet.id) {
          // dùng pet đã tồn tại
          petId = data.pet.id;
        } else {
          // tạo pet mới
          let newPet = await db.Pet.create({
            name: data.pet.name,
            species: data.pet.species,
            breed: data.pet.breed,
            birthday: data.pet.birthday,
            weight: data.pet.weight,
            gender: data.pet.gender,
            status: data.pet.status || "active",
            ownerId: user.id,
          });

          petId = newPet.id;
        }
      }

      // ===================== CREATE BOOKING =====================
      let token = uuidv4();

      let booking = await db.Booking.create({
        statusID: "S1",
        doctorID: data.doctorID,
        patientID: user.id,
        petId: petId,
        date: data.date,
        timeType: data.timeType,
        token: token,
        reason: data.reason,
      });

      // ===================== SAVE BOOKING IMAGES (BLOB) =====================
      if (data.images && data.images.length > 0) {
        for (let img of data.images) {
          let base64 = img.data || img; // nếu FE chỉ gửi raw base64
          let cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
          let buffer = Buffer.from(cleanBase64, "base64");

          await db.BookingImage.create({
            bookingId: booking.id,
            imageUrl: buffer,
          });
        }
      }

      return resolve({
        errCode: 0,
        errMessage: "Booking & Pet saved!",
      });
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

let getBookingStatusByEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!email) {
        return resolve({
          errCode: 1,
          errMessage: "Missing email",
          data: [],
        });
      }

      // tìm user có email
      let user = await db.User.findOne({
        where: { email: email },
        attributes: ["id"],
      });

      if (!user) {
        return resolve({
          errCode: 2,
          errMessage: "Email not exist",
          data: [],
        });
      }

      // lấy lịch của user này, nhưng chỉ lấy status = S2
      let data = await db.Booking.findAll({
        where: {
          patientId: user.id,
          statusId: { [Op.in]: ["S1", "S2", "S4"] },
        },
        attributes: [
          "id",
          "statusId",
          "date",
          "timeType",
          "animal",
          "doctorId",
        ],
        include: [
          {
            model: db.User,
            as: "doctorData",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "gender",
              "phoneNumber",
              "image",
              "email",
            ],
            include: [
              {
                model: db.Allcode,
                as: "genderData",
                attributes: ["valueEN", "valueVI"],
              },
            ],
          },
          {
            model: db.User,
            as: "patientData",
            attributes: ["id", "email", "firstName", "gender", "address"],

            include: [
              {
                model: db.Allcode,
                as: "genderData",
                attributes: ["valueEN", "valueVI"],
              },
            ],
          },
          {
            model: db.Allcode,
            as: "timeTypeDataPatient",
            attributes: ["valueEN", "valueVI"],
          },
          {
            model: db.Allcode,
            as: "statusData",
            attributes: ["valueEN", "valueVI"],
          },
          {
            model: db.ZaloPayPayment,
            as: "paymentData",
            attributes: ["status"],
            required: false,
          },
        ],
        raw: true,
        nest: true,
      });

      return resolve({
        errCode: 0,
        errMessage: "OK",
        data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let cancelBooking = async (bookingId) => {
  try {
    if (!bookingId) {
      return {
        errCode: 1,
        errMessage: "Missing bookingId",
      };
    }

    let booking = await db.Booking.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        errCode: 2,
        errMessage: "Booking not found",
      };
    }

    // update sang S5 (ẩn hoàn toàn trên FE)
    await db.Booking.update({ statusID: "S5" }, { where: { id: bookingId } });

    return {
      errCode: 0,
      errMessage: "Cancel success",
    };
  } catch (e) {
    console.log("Service error:", e);
    return {
      errCode: -1,
      errMessage: "Server error",
    };
  }
};

let rescheduleBooking = async (data) => {
  try {
    if (!data.bookingId || !data.date || !data.timeType) {
      return {
        errCode: 1,
        errMessage: "Missing required params",
      };
    }

    await db.Booking.update(
      {
        date: data.date,
        timeType: data.timeType,
        statusID: "S1", // đưa về trạng thái chờ xác nhận lại
      },
      { where: { id: data.bookingId } }
    );

    return { errCode: 0, errMessage: "Reschedule success" };
  } catch (e) {
    console.log("Service error:", e);
    return { errCode: -1, errMessage: "Server error" };
  }
};

let getBookingStatusS3 = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!email) {
        return resolve({
          errCode: 1,
          errMessage: "Missing email",
          data: [],
        });
      }

      // tìm user theo email
      let user = await db.User.findOne({
        where: { email: email },
        attributes: ["id"],
      });

      if (!user) {
        return resolve({
          errCode: 2,
          errMessage: "Email not exist",
          data: [],
        });
      }

      // lấy lịch có status = S3
      let data = await db.Booking.findAll({
        where: {
          patientId: user.id,
          statusId: "S3",
        },
        attributes: [
          "id",
          "statusId",
          "date",
          "timeType",
          "animal",
          "doctorId",
        ],
        include: [
          {
            model: db.User,
            as: "doctorData",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "gender",
              "phoneNumber",
              "image",
              "email",
            ],
            include: [
              {
                model: db.Allcode,
                as: "genderData",
                attributes: ["valueEN", "valueVI"],
              },
            ],
          },
          {
            model: db.User,
            as: "patientData",
            attributes: ["email", "firstName", "gender", "address"],
            include: [
              {
                model: db.Allcode,
                as: "genderData",
                attributes: ["valueEN", "valueVI"],
              },
            ],
          },
          {
            model: db.Allcode,
            as: "timeTypeDataPatient",
            attributes: ["valueEN", "valueVI"],
          },
          {
            model: db.Allcode,
            as: "statusData",
            attributes: ["valueEN", "valueVI"],
          },
        ],
        raw: true,
        nest: true,
      });

      return resolve({
        errCode: 0,
        errMessage: "OK",
        data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let postBookAppointmentAI = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // ===================== VALIDATION =====================
      if (
        !data.email ||
        !data.fullname ||
        !data.selectedGender ||
        !data.address ||
        !data.timeType ||
        !data.date
      ) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required booking fields",
        });
      }

      // ===================== UPSERT USER =====================
      let [user] = await db.User.findOrCreate({
        where: { email: data.email },
        defaults: {
          email: data.email,
          roleId: "R3",
          gender: data.selectedGender,
          address: data.address,
          firstName: data.fullname,
          phoneNumber: data.phoneNumber,
        },
      });

      // ===================== DETERMINE DOCTOR =====================
      let doctorID = data.doctorID || null;

      // Nếu không chọn bác sĩ → chọn từ chuyên khoa
      if (!doctorID && data.specialtyID) {
        const doctors = await db.Doctor_Info.findAll({
          where: { specialtyId: data.specialtyID },
        });

        if (!doctors || doctors.length === 0) {
          return resolve({
            errCode: 2,
            errMessage: "No doctor available in this specialty",
          });
        }

        // Lấy ngẫu nhiên 1 bác sĩ
        const randomDoctor =
          doctors[Math.floor(Math.random() * doctors.length)];
        doctorID = randomDoctor.doctorId;
      }

      if (!doctorID) {
        return resolve({
          errCode: 3,
          errMessage: "You must select a doctor or a specialty",
        });
      }

      // ===================== CREATE PET IF PROVIDED =====================
      let petId = null;

      if (data.pet) {
        if (data.pet.id) {
          petId = data.pet.id;
        } else {
          let newPet = await db.Pet.create({
            name: data.pet.name,
            species: data.pet.species,
            breed: data.pet.breed,
            birthday: data.pet.birthday,
            weight: data.pet.weight,
            gender: data.pet.gender,
            status: data.pet.status || "active",
            ownerId: user.id,
          });

          petId = newPet.id;
        }
      }

      // ===================== CREATE BOOKING =====================
      let token = uuidv4();

      let booking = await db.Booking.create({
        statusID: "S1",
        doctorID: doctorID,
        patientID: user.id,
        petId: petId,
        date: data.date,
        timeType: data.timeType,
        token: token,
        reason: data.reason || "",
      });

      // ===================== SAVE BOOKING IMAGES (BLOB) =====================
      if (data.images && data.images.length > 0) {
        for (let img of data.images) {
          let base64 = img.data || img;
          let cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
          let buffer = Buffer.from(cleanBase64, "base64");

          await db.BookingImage.create({
            bookingId: booking.id,
            imageUrl: buffer,
          });
        }
      }

      return resolve({
        errCode: 0,
        errMessage: "Booking (AI) saved!",
        bookingId: booking.id,
        doctorID: doctorID,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
  getBookingHistory: getBookingHistory,
  getBookingStatusByEmail,
  cancelBooking,
  rescheduleBooking,
  getBookingStatusS3,
  postBookAppointmentAI,
};
