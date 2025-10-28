import db from "../models/index";
require("dotenv").config();
import _ from "lodash";
import emailService from "../services/emailService";
import { Op } from "sequelize";

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        where: { roleId: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEN", "valueVI"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEN", "valueVI"],
          },
        ],
        raw: true,
        nest: true,
      });

      resolve({
        errCode: 0,
        data: users,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password", "image"],
        },
      });

      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let checkRequiredFields = (inputData) => {
  let arrFields = [
    "doctorId",
    "contentHTML",
    "contentMarkdown",
    "action",
    "selectedPrice",
    "selectedPayment",
    "selectedProvince",
    "addressClinic",
    "nameClinic",
    "note",
    "specialtyID",
  ];
  let isValid = true;
  let element = "";
  for (let i = 0; i < arrFields.length; i++) {
    if (!inputData[arrFields[i]]) {
      isValid = false;
      element = arrFields[i];
      break;
    }
  }
  return {
    isValid: isValid,
    element: element,
  };
};

let saveDetailInforDoctor = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkObj = checkRequiredFields(inputData);
      if (checkObj.isValid === false) {
        resolve({
          errCode: 1,
          errMessage: `Missing Parameter: ${checkObj.element}`,
        });
      } else {
        //upsert to markdown
        if (inputData.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });
        } else if (inputData.action === "EDIT") {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false,
          });
          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = inputData.contentHTML;
            doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
            doctorMarkdown.description = inputData.description;
            await doctorMarkdown.save();
          }
        }

        //upsert to doctor_infor
        let doctorInfor = await db.Doctor_Infor.findOne({
          where: {
            doctorID: inputData.doctorId,
          },
          raw: false,
        });
        if (doctorInfor) {
          //update
          doctorInfor.doctorID = inputData.doctorId;
          doctorInfor.priceID = inputData.selectedPrice;
          doctorInfor.paymentID = inputData.selectedPayment;
          doctorInfor.provinceID = inputData.selectedProvince;
          doctorInfor.addressClinic = inputData.addressClinic;
          doctorInfor.nameClinic = inputData.nameClinic;
          doctorInfor.note = inputData.note;
          doctorInfor.specialtyID = inputData.specialtyID;
          doctorInfor.clinicID = inputData.clinicID;
          await doctorInfor.save();
        } else {
          //create
          await db.Doctor_Infor.create({
            doctorID: inputData.doctorId,
            priceID: inputData.selectedPrice,
            paymentID: inputData.selectedPayment,
            provinceID: inputData.selectProvince,
            addressClinic: inputData.addressClinic,
            nameClinic: inputData.nameClinic,
            note: inputData.note,
            specialtyID: inputData.specialtyID,
            clinicID: inputData.clinicID,
          });
        }

        resolve({
          errCode: 0,
          errMessage: "save infor doctor succeed !",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEN", "valueVI"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorID"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEN", "valueVI"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEN", "valueVI"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEN", "valueVI"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }

        if (!data) {
          data = {};
        }
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorID || !data.formatedDate) {
        resolve({
          errCode: 1,
          errMessage: "Missing Parameter paramater!",
        });
      } else {
        let schedule = data.arrSchedule;
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            return item;
          });
        }

        //get all exisiting data
        let exisiting = await db.Schedule.findAll({
          where: { doctorID: data.doctorID, date: data.formatedDate },
          attributes: ["timeType", "date", "doctorID", "maxNumber"],
          raw: true,
        });

        //compare different
        let toCreate = _.differenceWith(schedule, exisiting, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        });

        //create data
        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate);
        }

        resolve({
          errCode: 0,
          errMessage: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getScheduleByDate = (doctorID, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorID || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters",
        });
      } else {
        let dataschedule = await db.Schedule.findAll({
          where: {
            doctorID: doctorID,
            date: date,
          },
          include: [
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEN", "valueVI"],
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!dataschedule) dataschedule = [];

        resolve({
          errCode: 0,
          data: dataschedule,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getExtraInforDoctorById = (idInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!idInput) {
        resolve({
          errCode: 1,
          errMessage: "Missing required Parameter!",
        });
      } else {
        let data = await db.Doctor_Infor.findOne({
          where: {
            doctorID: idInput,
          },
          attributes: {
            exclude: ["id", "doctorID"],
          },
          include: [
            {
              model: db.Allcode,
              as: "priceTypeData",
              attributes: ["valueEN", "valueVI"],
            },
            {
              model: db.Allcode,
              as: "paymentTypeData",
              attributes: ["valueEN", "valueVI"],
            },
            {
              model: db.Allcode,
              as: "provinceTypeData",
              attributes: ["valueEN", "valueVI"],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getProfileDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEN", "valueVI"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorID"],
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEN", "valueVI"],
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEN", "valueVI"],
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEN", "valueVI"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }

        if (!data) {
          data = {};
        }
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

// let getListPatientForDoctor = (doctorID, date) => {
//   return new Promise(async (resolve, reeject) => {
//     try {
//       if (!doctorID || !date) {
//         resolve({
//           errCode: 1,
//           errMessage: "Missing required parameters!",
//         });
//       } else {
//         let data = await db.Booking.findAll({
//           where: {
//             statusID: "S2",
//             doctorID: doctorID,
//             date: date,
//           },
//           include: [
//             {
//               model: db.User, // qua patienService ham postBookAppointment chinh them anial
//               attributes: ["email", "firstName", "gender", "address"],
//               as: "patientData",
//               include: [
//                 {
//                   model: db.Allcode,
//                   as: "genderData",
//                   attributes: ["valueEN", "valueVI"],
//                 },
//               ],
//             },
//             {
//               model: db.Allcode,
//               as: "timeTypeDataPatient",
//               attributes: ["valueEN", "valueVI"],
//             },
//           ],
//           raw: false,
//           nest: true,
//         });

//         resolve({
//           errCode: 0,
//           data: data,
//         });
//       }
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

let getListPatientForDoctor = (doctorID, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorID || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        // Chuyển timestamp thành dạng ngày bắt đầu và kết thúc trong ngày đó
        let startOfDay = new Date(+date);
        startOfDay.setHours(0, 0, 0, 0);

        let endOfDay = new Date(+date);
        endOfDay.setHours(23, 59, 59, 999);

        let data = await db.Booking.findAll({
          where: {
            statusID: "S2",
            doctorID: doctorID,
            // date: {
            //   [Op.between]: [startOfDay, endOfDay],
            // },
            date: date,
          },
          include: [
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
          ],
          raw: false,
          nest: true,
        });

        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.doctorID || !data.email || !data.patientID || !data.timeType) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters!",
        });
      } else {
        //update patient status
        let appointment = await db.Booking.findOne({
          where: {
            doctorID: data.doctorID,
            patientID: data.patientID,
            timeType: data.timeType,
            statusID: "S2",
          },
          raw: false,
        });

        if (appointment) {
          appointment.statusID = "S3";
          await appointment.save();
        }

        //send email remedy
        await emailService.sendAttachment(data);
        resolve({
          errCode: 0,
          errMessage: "ok",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getPendingDoctors = async () => {
  try {
    let doctors = await db.User.findAll({
      where: { roleId: "R2", status: "PENDING" },
      attributes: { exclude: ["password"] }, // không trả password
    });

    return {
      errCode: 0,
      data: doctors,
    };
  } catch (e) {
    console.log("getPendingDoctors service error: ", e);
    return {
      errCode: -1,
      errMessage: "Error from server",
    };
  }
};

const approveDoctor = async (doctorId) => {
  try {
    let result = await db.User.update(
      { status: "APPROVED" },
      { where: { id: doctorId, roleId: "R2" } } // chỉ áp dụng cho bác sĩ
    );

    if (result[0] === 0) {
      return { errCode: 1, errMessage: "Doctor not found or not eligible" };
    }

    return { errCode: 0, errMessage: "Doctor approved successfully" };
  } catch (e) {
    console.log("approveDoctor service error:", e);
    return { errCode: -1, errMessage: "Server error" };
  }
};

const rejectDoctor = async (doctorId) => {
  try {
    let result = await db.User.update(
      { status: "REJECTED" },
      { where: { id: doctorId } }
    );
    if (result[0] === 0) {
      return { errCode: 1, errMessage: "Doctor not found" };
    }

    return { errCode: 0, errMessage: "Doctor rejected successfully" };
  } catch (e) {
    console.log("rejectDoctorService error:", e);
    return { errCode: -1, errMessage: "Server error" };
  }
};

let sendInterviewEmail = async (data) => {
  try {
    const { doctorId, date, time, method, contact } = data;

    // ✅ 1. Lấy thông tin bác sĩ từ DB
    let doctor = await db.User.findOne({
      where: { id: doctorId },
      raw: true,
    });

    if (!doctor) {
      return { errCode: 1, errMessage: "Không tìm thấy bác sĩ" };
    }

    // ✅ 2. Định dạng lại ngày & giờ
    // Chuyển '2025-10-09' → '09/10/2025'
    const formattedDate = new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Đảm bảo giờ hiển thị đúng 24h (nếu người dùng chọn input type="time" thì mặc định là 24h)
    // Nhưng ta vẫn đảm bảo format chuẩn “HH:mm”
    const [hours, minutes] = time.split(":");
    const formattedTime = `${hours.padStart(2, "0")}:${minutes.padStart(
      2,
      "0"
    )}`;

    // ✅ 3. Chuẩn bị dữ liệu gửi sang emailService
    let dataSend = {
      email: doctor.email,
      doctorName: `${doctor.lastName} ${doctor.firstName}`,
      date: formattedDate,
      time: formattedTime,
      method,
      contact,
    };

    // ✅ 4. Gửi email
    await emailService.sendInterviewEmail(dataSend);

    return { errCode: 0, message: "Email phỏng vấn đã được gửi!" };
  } catch (e) {
    console.log("sendInterviewEmail error:", e);
    return { errCode: -1, errMessage: "Lỗi server khi gửi email" };
  }
};

let getApprovedDoctorsList = async () => {
  try {
    let doctors = await db.User.findAll({
      where: { roleId: "R2", status: "APPROVED" },
      attributes: { exclude: ["password"] },
    });

    return {
      errCode: 0,
      data: doctors,
    };
  } catch (e) {
    throw e;
  }
};

// let getRejectedDoctors = async () => {
//   try {
//     let doctors = await db.User.findAll({
//       where: { roleId: "R2", status: "REJECTED" },
//       attributes: { exclude: ["password"] },
//     });

//     return {
//       errCode: 0,
//       data: doctors,
//     };
//   } catch (e) {
//     throw e;
//   }
// };

let activateDoctor = async (doctorId) => {
  try {
    let doctor = await db.User.findOne({
      where: { id: doctorId, roleId: "R2", status: "APPROVED" }, // ví dụ R2 là role bác sĩ
    });

    if (!doctor) {
      return {
        errCode: 1,
        errMessage: "Doctor not found!",
      };
    }

    await db.User.update({ status: "ACTIVE" }, { where: { id: doctorId } });

    return {
      errCode: 0,
      message: "Doctor activated successfully!",
    };
  } catch (e) {
    console.log("activateDoctor service error: ", e);
    return {
      errCode: -1,
      errMessage: "Error from server",
    };
  }
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  saveDetailInforDoctor: saveDetailInforDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getExtraInforDoctorById: getExtraInforDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getApprovedDoctorsList,
  // getRejectedDoctors,
  activateDoctor,
  sendInterviewEmail,
};
